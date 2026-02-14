import Seller from "../model/seller_model";
import Product from "../model/product_model";
import Comment from "../model/comment_model";
import Like from "../model/like_model";
import { Request, Response, NextFunction } from "express";
import {
  bad_request,
  conflict,
  internal,
  not_found,
  unauthorized,
} from "../middleware/error_handler";
import { compute_display_rating } from "../utils/helper";
import mongoose from "mongoose";

export const create_seller_profile = async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user_id = (req as any).user._id;
    if (!user_id) {
      return next(unauthorized("unauthorised"));
    }

    const existing_seller_profile = await Seller.findOne({ user_id });
    if (existing_seller_profile) {
      return res.status(200).json({
        success: true,
        message: "Seller profile already exists",
        data: existing_seller_profile,
      });
    }

    const { store_name, store_description, store_address, store_logo } = req.body;

    if (!store_name) {
      return next(bad_request("Store name is required"));
    }

    if (!store_description) {
      return next(bad_request("Store description is required"));
    }

    if(!store_logo) {
      return next(bad_request("Store logo is a must"))
    }

    const require_address = ["street", "city", "state", "postcode", "country"];
    for (const field of require_address) {
      if (!store_address?.[field]) {
        return next(bad_request(`Store address.${field} is required`));
      }
    }

    //create if dont exist
    const seller = new Seller({
      user_id,
      store_name,
      store_description: store_description || "",
      store_address,
      store_logo,
      seller_status: "pending",
    });

    await seller.save();

    return res.status(201).json({
      success: true,
      message: "Seller profile created",
      data: seller,
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



export const get_seller_profile = async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user_id = (req as any).user._id;
    if (!user_id) {
      return next(unauthorized("Unauthorised"));
    }
    const seller = await Seller.findOne({ user_id });
    if (!seller) {
      return next(not_found("seller profile not found"));
    }

    return res
      .status(200)
      .json({ message: "Seller found", success: true, data: seller });
  } catch (err: any) {
    //return error from Schema
    if (err.name === "ValidationError") {
      return next(bad_request(err.message));
    }
    //return intertal 500
    return next(internal(err.message));
  }
};

export const get_status = async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user_id = (req as any).user._id;
    if (!user_id) {
      return next(unauthorized("Unauthorised"));
    }

    const seller = await Seller.findOne({ user_id }).select(
      "_id seller_status stripe_onboarded store_name",
    );
    return res.status(200).json({
      success: true,
      is_seller: !!seller,
      seller: seller || null,
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

export const get_stats = async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user_id = (req as any).user._id;

    const product_stats = await Product.aggregate([
      { $match: { product_user: user_id } },
      {
        $group: {
          _id: null,
          published_posts: { $sum: 1 },
          avg_view: { $avg: "$product_view_count" },
          product_ids: { $push: "$_id" },
        },
      },
    ]);

    if (product_stats.length === 0) {
      return res.status(200).json({
        published_posts: 0,
        total_likes: 0,
        total_comments: 0,
        avg_view: 0,
      });
    }

    const { published_posts, avg_view, product_ids } = product_stats[0];

    //comments
    const comments_agg = await Comment.aggregate([
      { $match: { product: { $in: product_ids } } },
      { $group: { _id: null, total: { $sum: 1 } } },
    ]);

    //likes
    const likes_agg = await Like.aggregate([
      { $match: { product: { $in: product_ids } } },
      { $group: { _id: null, total: { $sum: 1 } } },
    ]);

    return res.status(200).json({
      published_posts,
      total_likes: likes_agg[0]?.total || 0,
      total_comments: comments_agg[0]?.total || 0,
      avg_view: Math.round(avg_view || 0),
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

//get seller from product
export const get_seller_from_product = async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const product_id = req.params.product_id;
    const product = await Product.findById(product_id);
    if (!product) {
      return next(not_found("Product not found"));
    }

    const seller = await Seller.findOne({
      user_id: product.product_user,
    });
    if (!seller) {
      return next(not_found("Seller not found"));
    }

    return res
      .status(200)
      .json({ success: true, seller, message: "Seller found" });
  } catch (err: any) {
    return next(internal(err.message));
  }
};

export const list_products_by_seller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerUserId = req.params.userId;

    if (!sellerUserId) {
      return next(bad_request("Seller user id required"));
    }

    const products = await Product.aggregate([
      {
        $match: {
          product_user: new mongoose.Types.ObjectId(sellerUserId),
        },
      },

      // Likes
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "product",
          as: "likes",
        },
      },

      // Comments
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "product",
          as: "comments",
        },
      },

      // Counts
      {
        $addFields: {
          like_count: { $size: "$likes" },
          comment_count: { $size: "$comments" },
        },
      },

      // Remove arrays
      {
        $project: {
          likes: 0,
          comments: 0,
        },
      },
    ]);

    const finalProducts = products.map((p) => {
      const { avgIC, avgStars } = compute_display_rating(p);

      return {
        ...p,
        avgIC: Number(avgIC.toFixed(2)),
        avgStars: Number(avgStars.toFixed(2)),
      };
    });

    return res.status(200).json({
      success: true,
      data: finalProducts,
      meta: {
        total: finalProducts.length,
      },
    });
  } catch (err: any) {
    return next(internal(err.message));
  }
};

export const seller_store_page_edit = async function(req:Request, res:Response, next:NextFunction){
  try {
    
  } catch (err:any)
{
  
}}
