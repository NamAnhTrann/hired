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

      const user_id = (req as any).user._id;
      if (!user_id) {
        return next(unauthorized("Not authorised"));
      }
      const existing = await Like.findOne({ user: user_id, product: product_id });
      if (existing) {
        return next(bad_request("You already liked this product"));
      }

      const like = await Like.create({
        user: user_id,
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

      const comment = await Comment.findById(comment_id).populate(
        "user",
        "user_username user_email"
      );
      if (!comment) return next(not_found("Comment not found"));

      const user_id = (req as any).user._id;
      if (!user_id) return next(unauthorized("Not authorised"));

      // prevent duplicate like
      const existing = await Like.findOne({ user: user_id, comment: comment_id });
      if (existing) return next(bad_request("You already liked this comment"));

      // create like
      await Like.create({
        user: user_id,
        comment: comment_id,
      });

      // updated like count
      const likeCount = await Like.countDocuments({ comment: comment_id });

      return res.status(200).json({
        success: true,
        message: "Comment liked",
        data: {
          comment: {
            ...comment.toObject(),
            like_count: likeCount,
            liked_by_user: true,
          },
        },
      });
    } catch (err: any) {
      if (err.name === "ValidationError") {
        return next(bad_request(err.message));
      }
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

      const user_id = (req as any).user._id;
      if (!user_id) return next(unauthorized("Not authorised"));

      const filter: any = { user: user_id };

      if (type === "product") {
        filter.product = target_id;
      } else if (type === "comment") {
        filter.comment = target_id;
      } else {
        return next(bad_request("Invalid Type"));
      }

      const deleted = await Like.deleteOne(filter);
      if (deleted.deletedCount === 0) {
        return next(not_found("Like does not exist"));
      }

      // if unlike is for a COMMENT, return updated state
      if (type === "comment") {
        const updatedComment = await Comment.findById(target_id)
          .populate("user", "user_username user_email")
          .lean();

        const likeCount = await Like.countDocuments({ comment: target_id });

        return res.status(200).json({
          success: true,
          message: "unliked",
          data: {
            comment: {
              ...updatedComment,
              like_count: likeCount,
              liked_by_user: false,
            },
          },
        });
      }

      // for product only
      return res.status(200).json({
        success: true,
        message: "unliked",
      });
    } catch (err: any) {
      if (err.name === "ValidationError") {
        return next(bad_request(err.message));
      }
      return next(internal(err.message));
    }
  };

