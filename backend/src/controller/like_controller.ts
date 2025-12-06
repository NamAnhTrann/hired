import Like from "../model/like_model";
import Product from "../model/product_model";
import Comment from "../model/comment_model";
import { Request, Response, NextFunction } from "express";
import {
  bad_request,
  internal,
  not_found,
  unauthorized,
} from "../middleware/error_handler";

export const like_product = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { product_id } = req.body;

    if (!product_id) {
      return next(bad_request("Missing product Id"));
    }

    const product = await Product.findById(product_id);
    if (!product) {
      return next(not_found("Product not found"));
    }

    const like = await Like.create({
      user: (req as any).user._id,
      product: product_id,
    });

    return res
      .status(200)
      .json({ data: like, success: true, message: "Liked product" });
  } catch (err: any) {
    //this will handle errors from Schemas
    if (err.name === "ValidationError") {
      return next(bad_request(err.message));
    }
    //call the error handler
    return next(internal(err.message));
  }
};

//like comments
export const like_comment = async function like_comment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { comment_id } = req.body;

    if (!comment_id) return next(bad_request("Missing comment_id"));
    const comment = await Comment.findById(comment_id);
    if (!comment) return next(not_found("Comment not found"));

    const like = await Like.create({
      user: (req as any).user._id,
      comment: comment_id,
    });

    return res.status(200).json({
      success: true,
      message: "Comment liked",
      data: like,
    });
  } catch (err: any) {
    //this will handle errors from Schemas
    if (err.name === "ValidationError") {
      return next(bad_request(err.message));
    }
    //call the error handler
    return next(internal(err.message));
  }
};

//unlike comments
export const unlike = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { target_id, type } = req.body;

    if (!target_id || !type) {
      return next(bad_request("Missing target id or type"));
    }

    let filter: any = { user: (req as any).user._id };
    if (type === "product") {
      filter.product = target_id;
    } else if (type === "comment") {
      filter.comment = target_id;
    } else {
      return next(bad_request("Invalid Type"));
    }

    await Like.deleteOne(filter);

    return res.status(200).json({
      success: true,
      message: "unliked",
    });
  } catch (err: any) {
    //this will handle errors from Schemas
    if (err.name === "ValidationError") {
      return next(bad_request(err.message));
    }
    //call the error handler
    return next(internal(err.message));
  }
};
