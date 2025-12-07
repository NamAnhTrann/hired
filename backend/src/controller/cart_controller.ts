import Product from "../model/product_model";
import Cart from "../model/cart_model";

import { Request, Response, NextFunction } from "express";
import {
  bad_request,
  internal,
  not_found,
  unauthorized,
} from "../middleware/error_handler";

export const add_cart = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user_id = (req as any).user?._id;
    if (!user_id) {
      return next(unauthorized("Unauthorised"));
    }

    const { product_id, quantity } = req.body;

    if (!product_id || !quantity) {
      return next(bad_request("Missing product_id or quantity"));
    }

    // Check product exists
    const product = await Product.findById(product_id);
    if (!product) {
      return next(not_found("Product not found"));
    }

    // Find user's cart or create new one
    let cart = await Cart.findOne({ user_id });
    if (!cart) {
      cart = new Cart({
        user_id,
        item: [],
        cart_subtotal: 0,
      });
    }

    // Check if item already exists in cart
    const existing_item = cart.item.find(function (item) {
      return item.product_id.toString() === product_id;
    });

    if (existing_item) {
      existing_item.cart_quantity += quantity;
    } else {
      cart.item.push({
        product_id: product_id,
        cart_quantity: quantity,
      });
    }

    // Recalculate subtotal
    let total = 0;

    for (const item of cart.item) {
      const products = await Product.findById(item.product_id);

      if (!products) {
        return next(bad_request("Products cant be found"));
      }

      total += products.product_price * item.cart_quantity;
    }

    cart.cart_subtotal = total;

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      data: cart,
    });
  } catch (err: any) {
    if (err.name === "ValidationError") {
      return next(bad_request(err.message));
    }
    return next(internal(err.message));
  }
};

export const list_cart = async function (
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
      "item.product_id",
      "product_title product_description product_price product_image product_category"
    );

    if (!cart) {
      return next(not_found("cart cannot be found"));
    }

    return res
      .status(200)
      .json({ data: cart, success: true, message: "cart listed" });
  } catch (err: any) {
    if (err.name === "ValidationError") {
      return next(bad_request(err.message));
    }
    return next(internal(err.message));
  }
};

export const delete_per_item_cart = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user._id;
    const { product_id } = req.params;

    if (!user) {
      return next(unauthorized("Unauthorised"));
    }
    if (!product_id) {
      return next(not_found("Cant find product id"));
    }

    const cart = await Cart.findOne({ user_id: user });
    if (!cart) {
      return next(not_found("Cant find cart"));
    }

    const item_index = cart.item.findIndex(
      (item) => item.product_id.toString() === product_id
    );

    if (item_index === -1) {
      return next(bad_request("item not found in cart"));
    }

    //remove item from cart (per item in cart)
    cart.item.splice(item_index, 1);

    //recalc price
    let total = 0;
    for (const item of cart.item) {
      const products = await Product.findById(item.product_id);
      if (!products) {
        return next(bad_request("Products cant be found"));
      }
      total += products.product_price * item.cart_quantity;
    }
    cart.cart_subtotal = total;
    await cart.save();
    const update_cart = await Cart.findById(cart._id).populate(
      "item.product_id",
      "product_title product_description product_price product_image product_category"
    );
    return res
      .status(200)
      .json({ data: update_cart, success: true, message: "item removed" });
  } catch (err: any) {
    if (err.name === "ValidationError") {
      return next(bad_request(err.message));
    }
    return next(internal(err.message));
  }
};
