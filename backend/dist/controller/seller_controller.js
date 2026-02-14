"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seller_store_page_edit = exports.list_products_by_seller = exports.get_seller_from_product = exports.get_stats = exports.get_status = exports.get_seller_profile = exports.create_seller_profile = void 0;
const seller_model_1 = __importDefault(require("../model/seller_model"));
const product_model_1 = __importDefault(require("../model/product_model"));
const comment_model_1 = __importDefault(require("../model/comment_model"));
const like_model_1 = __importDefault(require("../model/like_model"));
const error_handler_1 = require("../middleware/error_handler");
const helper_1 = require("../utils/helper");
const mongoose_1 = __importDefault(require("mongoose"));
const create_seller_profile = async function (req, res, next) {
    try {
        const user_id = req.user._id;
        if (!user_id) {
            return next((0, error_handler_1.unauthorized)("unauthorised"));
        }
        const existing_seller_profile = await seller_model_1.default.findOne({ user_id });
        if (existing_seller_profile) {
            return res.status(200).json({
                success: true,
                message: "Seller profile already exists",
                data: existing_seller_profile,
            });
        }
        const { store_name, store_description, store_address, store_logo } = req.body;
        if (!store_name) {
            return next((0, error_handler_1.bad_request)("Store name is required"));
        }
        if (!store_description) {
            return next((0, error_handler_1.bad_request)("Store description is required"));
        }
        if (!store_logo) {
            return next((0, error_handler_1.bad_request)("Store logo is a must"));
        }
        const require_address = ["street", "city", "state", "postcode", "country"];
        for (const field of require_address) {
            if (!store_address?.[field]) {
                return next((0, error_handler_1.bad_request)(`Store address.${field} is required`));
            }
        }
        //create if dont exist
        const seller = new seller_model_1.default({
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
    }
    catch (err) {
        //return error from Schema
        if (err.name === "ValidationError") {
            return next((0, error_handler_1.bad_request)(err.message));
        }
        //return intertal 500
        return next((0, error_handler_1.internal)(err.message));
    }
};
exports.create_seller_profile = create_seller_profile;
const get_seller_profile = async function (req, res, next) {
    try {
        const user_id = req.user._id;
        if (!user_id) {
            return next((0, error_handler_1.unauthorized)("Unauthorised"));
        }
        const seller = await seller_model_1.default.findOne({ user_id });
        if (!seller) {
            return next((0, error_handler_1.not_found)("seller profile not found"));
        }
        return res
            .status(200)
            .json({ message: "Seller found", success: true, data: seller });
    }
    catch (err) {
        //return error from Schema
        if (err.name === "ValidationError") {
            return next((0, error_handler_1.bad_request)(err.message));
        }
        //return intertal 500
        return next((0, error_handler_1.internal)(err.message));
    }
};
exports.get_seller_profile = get_seller_profile;
const get_status = async function (req, res, next) {
    try {
        const user_id = req.user._id;
        if (!user_id) {
            return next((0, error_handler_1.unauthorized)("Unauthorised"));
        }
        const seller = await seller_model_1.default.findOne({ user_id }).select("_id seller_status stripe_onboarded store_name");
        return res.status(200).json({
            success: true,
            is_seller: !!seller,
            seller: seller || null,
        });
    }
    catch (err) {
        //return error from Schema
        if (err.name === "ValidationError") {
            return next((0, error_handler_1.bad_request)(err.message));
        }
        //return intertal 500
        return next((0, error_handler_1.internal)(err.message));
    }
};
exports.get_status = get_status;
const get_stats = async function (req, res, next) {
    try {
        const user_id = req.user._id;
        const product_stats = await product_model_1.default.aggregate([
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
        const comments_agg = await comment_model_1.default.aggregate([
            { $match: { product: { $in: product_ids } } },
            { $group: { _id: null, total: { $sum: 1 } } },
        ]);
        //likes
        const likes_agg = await like_model_1.default.aggregate([
            { $match: { product: { $in: product_ids } } },
            { $group: { _id: null, total: { $sum: 1 } } },
        ]);
        return res.status(200).json({
            published_posts,
            total_likes: likes_agg[0]?.total || 0,
            total_comments: comments_agg[0]?.total || 0,
            avg_view: Math.round(avg_view || 0),
        });
    }
    catch (err) {
        //return error from Schema
        if (err.name === "ValidationError") {
            return next((0, error_handler_1.bad_request)(err.message));
        }
        //return intertal 500
        return next((0, error_handler_1.internal)(err.message));
    }
};
exports.get_stats = get_stats;
//get seller from product
const get_seller_from_product = async function (req, res, next) {
    try {
        const product_id = req.params.product_id;
        const product = await product_model_1.default.findById(product_id);
        if (!product) {
            return next((0, error_handler_1.not_found)("Product not found"));
        }
        const seller = await seller_model_1.default.findOne({
            user_id: product.product_user,
        });
        if (!seller) {
            return next((0, error_handler_1.not_found)("Seller not found"));
        }
        return res
            .status(200)
            .json({ success: true, seller, message: "Seller found" });
    }
    catch (err) {
        return next((0, error_handler_1.internal)(err.message));
    }
};
exports.get_seller_from_product = get_seller_from_product;
const list_products_by_seller = async (req, res, next) => {
    try {
        const sellerUserId = req.params.userId;
        if (!sellerUserId) {
            return next((0, error_handler_1.bad_request)("Seller user id required"));
        }
        const products = await product_model_1.default.aggregate([
            {
                $match: {
                    product_user: new mongoose_1.default.Types.ObjectId(sellerUserId),
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
            const { avgIC, avgStars } = (0, helper_1.compute_display_rating)(p);
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
    }
    catch (err) {
        return next((0, error_handler_1.internal)(err.message));
    }
};
exports.list_products_by_seller = list_products_by_seller;
const seller_store_page_edit = async function (req, res, next) {
    try {
    }
    catch (err) {
    }
};
exports.seller_store_page_edit = seller_store_page_edit;
