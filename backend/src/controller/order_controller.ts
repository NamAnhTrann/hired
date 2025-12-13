import Cart from "../model/cart_model";
import Order from "../model/order_model";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
import { Request, Response, NextFunction } from "express";
import {
  bad_request,
  internal,
  not_found,
  unauthorized,
} from "../middleware/error_handler";

export const create_order = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user_id = (req as any).user._id;
    if (!user_id) {
      return next(unauthorized("Unauthorised"));
    }

    const cart = await Cart.findOne({ user_id }).populate("item.product_id");
    if (!cart || cart.item.length === 0) {
      return next(bad_request("Cart is empty"));
    }

    const VAT_RATE = 0.1;

    const order_items = cart.item.map((item: any) => ({
      product_id: item.product_id._id,
      order_quantity: item.cart_quantity,
      subtotal: item.product_id.product_price * item.cart_quantity,
    }));

    const items_subtotal = order_items.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    const vat_amount = Math.round(items_subtotal * VAT_RATE * 100);
    const total_with_vat_cents = Math.round(items_subtotal * 100) + vat_amount;

    let existing_order = await Order.findOne({
      user_id,
      order_status: "pending",
    });

    if (existing_order) {
      existing_order.set("order_item", order_items);
      existing_order.vat_amount = vat_amount;
      existing_order.order_total_amount = total_with_vat_cents;

      await existing_order.save();

      return res.status(200).json({
        success: true,
        message: "Order updated from cart",
        data: existing_order,
      });
    }

    const new_order = new Order({
      user_id,
      cart_id: cart._id,
      order_item: order_items,
      vat_amount,
      order_total_amount: total_with_vat_cents,
    });

    await new_order.save();

    return res
      .status(201)
      .json({ message: "Order created", success: true, data: new_order });
  } catch (err: any) {
    //return error from Schema
    if (err.name === "ValidationError") {
      return next(bad_request(err.message));
    }
    //return intertal 500
    return next(internal(err.message));
  }
};

export const list_order = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user._id;
    if (!user) {
      return next(unauthorized("Unauthorised"));
    }

    const order = await Order.findOne({ user_id: user })
      .sort({ createdAt: -1, _id: -1 })
      .populate("order_item.product_id")
      .populate(
        "user_id",
        "user_first_name user_last_name user_email user_username user_phone_number"
      );

    if (!order) {
      return next(not_found("Order is not available"));
    }

    return res
      .status(200)
      .json({ message: "Order fetched", data: order, success: true });
  } catch (err: any) {
    //return error from Schema
    if (err.name === "ValidationError") {
      return next(bad_request(err.message));
    }
    //return intertal 500
    return next(internal(err.message));
  }
};

export const get_pending_order = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user_id = (req as any).user._id;
    const order = await Order.findOne({
      user_id,
      order_status: "pending",
    }).populate("order_item.product_id");

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err: any) {
    if (err.name === "ValidationError") {
      return next(bad_request(err.message));
    }
    return next(internal(err.message));
  }
};

export const create_checkout = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    const { order_id } = req.body;

    const order = await Order.findById(order_id).populate(
      "order_item.product_id"
    );

    if (!order) {
      return next(not_found("No order found"));
    }

    // Validate stock only (do NOT deduct here)
    for (const item of order.order_item) {
      const product: any = item.product_id;

      if (!product) {
        return next(bad_request("Invalid product in order"));
      }

      if (product.product_quantity < item.order_quantity) {
        return next(
          bad_request(
            `Not enough stock for ${product.product_title}. Only ${product.product_quantity} left.`
          )
        );
      }
    }

    // Build Stripe line items
    const line_items = order.order_item.map((i: any) => {
      const product = i.product_id as any;
      return {
        price_data: {
          currency: "aud",
          product_data: { name: product.product_title },
          unit_amount: Math.round(product.product_price * 100),
        },
        quantity: i.order_quantity,
      };
    });

    if (order.vat_amount > 0) {
      line_items.push({
        price_data: {
          currency: "aud",
          product_data: {
            name: "VAT (10%)",
          },
          unit_amount: order.vat_amount,
        },
        quantity: 1,
      });
    }

    const base_url = "http://localhost:4200/#";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      customer_email: user.user_email,
      metadata: {
        order_id: order._id.toString(),
      },
      payment_intent_data: {
        metadata: {
          order_id: order._id.toString(),
        },
      },
      success_url: `${base_url}/order-summary-page`,
      cancel_url: `${base_url}/marketplace-page`,
    });

    return res.json({ url: session.url });
  } catch (err: any) {
    if (err.name === "ValidationError") {
      return next(bad_request(err.message));
    }
    return next(internal(err.message));
  }
};

// export const cancel_order_customer = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const user_id = (req as any).user._id;
//     const { order_id } = req.body;

//     const order = await Order.findOne({ _id: order_id, user_id });
//     if (!order) {
//       return next(not_found("Order not found"));
//     }

//     if (order.order_status !== "pending") {
//       return next(bad_request("Only pending orders can be cancelled"));
//     }

//     order.order_status = "cancelled";
//     order.cancelled_by = "customer";
//     order.cancelled_at = new Date();
//     await order.save();

//     return res.status(200).json({
//       success: true,
//       message: "Order cancelled successfully",
//       data: order,
//     });
//   } catch (err: any) {
//     return next(internal(err.message));
//   }
// };

// //exact same thing but for ssytem so i use chatgpt

// export const cancel_order_system = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { order_id } = req.params;

//     const order = await Order.findById(order_id);
//     if (!order) {
//       return next(not_found("Order not found"));
//     }

//     if (order.order_status !== "pending") {
//       return next(bad_request("Only pending orders can be cancelled"));
//     }

//     order.order_status = "cancelled";
//     order.cancelled_by = "system";
//     order.cancelled_at = new Date();
//     await order.save();

//     return res.status(200).json({
//       success: true,
//       message: "Order cancelled by system",
//       data: order,
//     });
//   } catch (err: any) {
//     return next(internal(err.message));
//   }
// };
