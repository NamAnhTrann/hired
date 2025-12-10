import Comment from "../model/comment_model";
import Product from "../model/product_model";

import { comment_tree, delete_comment_tree } from "../utils/comment_tree";

import { Request, Response, NextFunction } from "express";
import {
  bad_request,
  internal,
  not_found,
  unauthorized,
} from "../middleware/error_handler";

export const add_comment = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    if (!user) {
      return next(unauthorized("Must be logged in to comment"));
    }

    const { product_id, text } = req.body;

    if (!product_id || !text) {
      return next(bad_request("Missing product id or text"));
    }

    const product = await Product.findById(product_id);
    if (!product) {
      return next(not_found("Product not found"));
    }

    //create comment objects
    const new_comment = new Comment({
      product: product_id,
      user: user._id,
      text: text,
    });

    //save and return
    await new_comment.save();
    await new_comment.populate("user", "user_username");

    return res
      .status(200)
      .json({ message: "Commend is added", success: true, data: new_comment });
  } catch (err: any) {
    //this will handle errors from Schemas
    if (err.name === "ValidationError") {
      return next(bad_request(err.message));
    }
    //call the error handler
    return next(internal("Failed to add contact"));
  }
};

//reply to comments
export async function reply_comment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { product_id, parent_comment, text } = req.body;

    // Validate input
    if (!product_id || !parent_comment || !text) {
      return next(bad_request("Missing fields for reply"));
    }

    const newReply = await Comment.create({
      product: product_id,
      parent_comment: parent_comment,
      text: text,
      user: (req as any).user._id,
    });

    return res.status(200).json({
      success: true,
      data: newReply,
      message: "Reply added",
    });
  } catch (err: any) {
    return next(internal(err.message));
  }
}

//list all the comments
export const list_comment = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const product_id = req.params.product_id;

    if (!product_id) {
      return next(bad_request("Missing product id"));
    }

    // Check if product exists
    const product = await Product.findById(product_id);
    if (!product) {
      return next(not_found("Product not found"));
    }

    // Fetch all comments for this product
    const comments = await Comment.find({ product: product_id })
      .populate("user", "user_username user_email")
      .sort({ createdAt: -1 })
      .lean();

    // Build nested comment structure (NO likes)
    const nested_comments = await comment_tree(comments);

    return res.status(200).json({
      success: true,
      data: nested_comments,
      message: "List of comments",
    });
  } catch (err: any) {
    if (err.name === "ValidationError") {
      return next(bad_request(err.message));
    }
    return next(internal(err.message));
  }
};


export const delete_comment = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;

    if (!user) {
      return next(unauthorized("Must be login"));
    }

    const comment_id = req.params.id;
    if (!comment_id) {
      return next(bad_request("Missing comment id"));
    }

    const comment = await Comment.findById(comment_id);
    if (!comment) {
  return res.status(200).json({
    success: true,
    message: "Already deleted"
  });
}


if (comment.user.toString() !== (user._id || user.id).toString()) {
      return next(unauthorized("Cannot delete someone else comment"));
    }

    await delete_comment_tree(comment_id);

    return res.status(200).json({
      success: true,
      message: "Comment and its replies deleted",
    });
  } catch (err: any) {
    //this will handle errors from Schemas
    if (err.name === "ValidationError") {
      return next(bad_request(err.message));
    }
    //call the error handler
    return next(internal("Failed to add comment"));
  }
};
