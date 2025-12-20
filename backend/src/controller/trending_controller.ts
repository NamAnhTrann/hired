import Product from "../model/product_model";
import { Request, Response, NextFunction } from "express";
import {
  bad_request,
  internal,
  not_found,
  unauthorized,
} from "../middleware/error_handler";

import Trending from "../model/trending_model";

export const add_trending_item = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user_id = (req as any).user._id;
    const { product_id } = req.body;

    if(!user_id) { 
      return next(unauthorized("Unauthorised"))
    }

    // Validate input
    if (!product_id) {
      return next(bad_request("Product ID is required"));
    }

    // Ensure product exists
    const product = await Product.findById(product_id);
    if (!product) {
      return next(not_found("Product not found"));
    }

    // Create trending item
    const new_trending = new Trending({
      product: product_id,
      added_at: new Date(),
    });

    await new_trending.save();

    return res.status(201).json({
      message: "Trending item added",
      trending: new_trending,
    });
  } catch (err: any) {
    return next(bad_request(err.message));
  }
};

export const list_trending = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const trending = await Trending.find({}).populate("product");
    return res.json({
      success: true,
      data: trending,
      message: "trending listed",
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
