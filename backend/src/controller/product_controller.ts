import Product from "../model/product_model";
import Like from "../model/like_model";
import Comment from "../model/comment_model";
import Seller from "../model/seller_model";

import {
  get_product_like_count,
  user_liked_product,
} from "../utils/like_service";

import { Request, Response, NextFunction } from "express";
import {
  bad_request,
  internal,
  not_found,
  unauthorized,
} from "../middleware/error_handler";

export const add_product = async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    //use req.user from auth
    //this is the same as req.user in JavaScript but with type safety
    const user = (req as any).user;

    if (!user) {
      return next(bad_request("User not authenticate to do this operation"));
    }

    const files = req.files as Express.Multer.File[] | undefined;

    const imagePaths: string[] = files
      ? files.map(
          (file) => `http://localhost:2020/uploads/products/${file.filename}`,
        )
      : [];

    const newProduct = new Product({
      product_title: req.body.product_title,
      product_description: req.body.product_description,
      product_price: req.body.product_price,
      product_quantity: req.body.product_quantity,
      product_image: imagePaths,
      product_category: req.body.product_category,
      product_view_count: 0,

      product_user: user._id,
    });
    await newProduct.save();
    return res
      .status(200)
      .json({ success: true, data: newProduct, message: "Product Added" });
  } catch (err: any) {
    //return error from Schema
    if (err.name === "ValidationError") {
      return next(bad_request(err.message));
    }
    //return intertal 500
    return next(internal(err.message));
  }
};

export const list_all_product = async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user_id = (req as any).user ? String((req as any).user._id) : "";

    // 1. Fetch products + user
    const products = await Product.find({})
      .populate("product_user", "_id user_username")
      .lean();

    if (products.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "List All Products",
      });
    }

    const productIds = products.map((p) => p._id);
    const userIds = products.map((p) => p.product_user?._id).filter(Boolean);

    // 2. LIKE COUNTS
    const likeCounts = await Like.aggregate([
      { $match: { product: { $in: productIds } } },
      { $group: { _id: "$product", total: { $sum: 1 } } },
    ]);

    const likeMap: Record<string, number> = {};
    likeCounts.forEach((item) => {
      likeMap[String(item._id)] = item.total;
    });

    // 3. COMMENT COUNTS
    const commentCounts = await Comment.aggregate([
      { $match: { product: { $in: productIds } } },
      { $group: { _id: "$product", total: { $sum: 1 } } },
    ]);

    const commentMap: Record<string, number> = {};
    commentCounts.forEach((item) => {
      commentMap[String(item._id)] = item.total;
    });

    // 4. USER LIKE STATUS
    const userLikedSet = new Set<string>();

    if (user_id) {
      const userLikes = await Like.find({
        user: user_id,
        product: { $in: productIds },
      }).lean();

      userLikes.forEach((like) => {
        userLikedSet.add(String(like.product));
      });
    }

    // 5. FETCH SELLERS (IMPORTANT PART)
    const sellers = await Seller.find({
      user_id: { $in: userIds },
      seller_status: "active",
    }).lean();

    const sellerMap = new Map(sellers.map((s) => [String(s.user_id), s]));

    // 6. FINAL RESPONSE
    const finalProducts = products.map((p) => ({
      ...p,
      seller: sellerMap.get(String(p.product_user?._id)) || null,
      like_count: likeMap[String(p._id)] || 0,
      comment_count: commentMap[String(p._id)] || 0,
      liked_by_user: userLikedSet.has(String(p._id)),
      product_view_count: p.product_view_count ?? 0,
    }));

    return res.status(200).json({
      success: true,
      data: finalProducts,
      message: "List All Products",
    });
  } catch (err: any) {
    if (err.name === "ValidationError") {
      return next(bad_request(err.message));
    }
    return next(internal(err.message));
  }
};

export const list_single_product = async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user_id = (req as any).user ? String((req as any).user._id) : "";
    const product_id = req.params.id;
    if (!product_id) {
      return next(not_found(`Cannot find product_id: ${product_id}`));
    }
    //view count
    const product = await Product.findByIdAndUpdate(
      product_id,
      { $inc: { product_view_count: 1 } },
      { new: true },
    )
      .populate("product_user", "user_username user_email")
      .lean();

    if (!product) {
      return next(not_found("Product not found"));
    }

    const like_count = await get_product_like_count(product_id);
    const comment_count = await Comment.countDocuments({ product: product_id });

    let liked_by_user = false;

    if (user_id) {
      liked_by_user = !!(await user_liked_product(user_id, product_id));
    }

    return res.status(200).json({
      success: true,
      data: {
        ...product,
        like_count,
        comment_count,
        liked_by_user,
      },
      message: "List Single Product",
    });
  } catch (err: any) {
    if (err.name === "ValidationError") return next(bad_request(err.message));
    return next(internal(err.message));
  }
};

export const list_my_products = async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user_id = (req as any).user?._id;

    if (!user_id) {
      return next(unauthorized("Not authenticated"));
    }

    const products = await Product.find({
      product_user: user_id,
    }).lean();

    return res.status(200).json({
      success: true,
      data: products,
      message: "List My Products",
    });
  } catch (err: any) {
    return next(internal(err.message));
  }
};

export const delete_product = async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user_id = (req as any).user._id;
    const product_id = req.params.id;
    if (!product_id) {
      return next(not_found("product not found"));
    }
    //delete product, and its commments and likes
    const product = await Product.findOneAndDelete({
      _id: product_id,
      product_user: user_id,
    });
    if (!product) {
      return next(not_found("Product not found"));
    }
    await Comment.deleteMany({
      product: product_id,
    });
    await Like.deleteMany({
      product: product_id,
    });

    return res.status(200).json({
      success: true,
      message: "Product deleted",
      data: product,
    });
  } catch (err: any) {
    if (err.name === "ValidationError") return next(bad_request(err.message));
    return next(internal(err.message));
  }
};

export const edit_product_details = async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user_id = (req as any).user._id;
    const product_id = req.params.id;

    if (!product_id) {
      return next(not_found("product not found"));
    }

    const update_product = await Product.findOneAndUpdate(
      {
        _id: product_id,
        product_user: user_id,
      },
      req.body,
      { new: true },
    );

    if (!update_product) {
      return next(not_found("Product not found"));
    }

    return res.status(200).json({
      success: true,
      message: "Product updated",
      data: update_product,
    });
  } catch (err: any) {
    if (err.name === "ValidationError") return next(bad_request(err.message));
    return next(internal(err.message));
  }
};
