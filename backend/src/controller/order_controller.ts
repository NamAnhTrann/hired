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
    const user = (req as any).user._id;
    if (!user) {
      return next(unauthorized("Unauthorised"));
    }

    const cart = await Cart.findOne({ user_id: user }).populate(
      "item.product_id"
    );
    if (!cart || cart.item.length === 0) {
      return next(bad_request("Cart is empty"));
    }

    let existing_order = await Order.findOne({
      user_id: user,
      order_status: "pending",
    });

    if (existing_order) {
      //need to update the existing order with current cart contents
      //we use set here since its an entire array of item
      //map() here is just to map cart items to order items without touching original cart items array
      existing_order.set(
        "order_item",
        cart.item.map((items: any) => ({
          product_id: items.product_id._id,
          order_quantity: items.cart_quantity,
          subtotal: items.product_id.product_price * items.cart_quantity,
        }))
      );
      existing_order.order_total_amount = String(cart.cart_subtotal * 1.1);
      await existing_order.save();
      return res.status(200).json({
        data: existing_order,
        success: true,
        message: "updated from cart",
      });
    }

    const total_with_VAT = cart.cart_subtotal + cart.cart_subtotal * 0.1;
    //can use .create({}) here but i dont want to lol
    const new_order = new Order({
      user_id: user,
      cart_id: cart._id,
      order_item: cart.item.map((i: any) => ({
        product_id: i.product_id._id,
        order_quantity: i.cart_quantity,
        subtotal: i.product_id.product_price * i.cart_quantity,
      })),

      order_total_amount: String(total_with_VAT),
    });
    await new_order.save();

    return res.status(200).json({
      data: new_order,
      success: true,
      message: "Order created",
    });
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
          unit_amount: product.product_price * 100,
        },
        quantity: i.order_quantity,
      };
    });

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

export const cancel_order_customer = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user._id;
    const { order_id } = req.body;

    const order = await Order.findById(order_id).populate(
      "order_item.product_id"
    );
    if (!order) {
      return next(not_found("Order not found"));
    }

    const NON_CANCELLABLE = [
      "paid",
      "shipped",
      "cancelled",
      "failed_out_of_stock",
    ];

    if (NON_CANCELLABLE.includes(order.order_status)) {
      return next(unauthorized("You cannot cancel this order"));
    }

    if (order.order_status !== "pending") {
      return next(bad_request("You cannot cancel a paid or shipped order"));
    }

    //restocking items back to inventory
    for (const item of order.order_item) {
      const product: any = item.product_id;
      product.product_quantity += item.order_quantity;
      await product.save();
    }

    order.order_status = "cancelled";
    order.cancelled_by = "customer";
    order.cancelled_at = new Date();
    await order.save();
    return res.status(200).json({
      success: true,
      message: "Order cancelled sucessfully",
      data: order,
    });
  } catch (err: any) {
    if (err.name === "ValidationError") {
      return next(bad_request(err.message));
    }
    return next(internal(err.message));
  }
};

//exact same thing but for ssytem so i use chatgpt
export const cancel_order_system = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { order_id } = req.params;

    const order = await Order.findById(order_id).populate(
      "order_item.product_id"
    );

    if (!order) return next(not_found("Order not found"));

    const NON_CANCELLABLE = [
      "paid",
      "shipped",
      "cancelled",
      "failed_out_of_stock",
    ];

    if (NON_CANCELLABLE.includes(order.order_status)) {
      return next(bad_request("Cannot cancel a paid order"));
    }

    // Restock all items
    for (const item of order.order_item) {
      const prod: any = item.product_id;
      prod.product_quantity += item.order_quantity;
      await prod.save();
    }

    order.order_status = "cancelled";
    order.cancelled_by = "system";
    order.cancelled_at = new Date();
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled by system",
      data: order,
    });
  } catch (err: any) {
    if (err.name === "ValidationError") {
      return next(bad_request(err.message));
    }
    return next(internal(err.message));
  }
};
