"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.list_single_product = exports.list_all_product = exports.add_product = void 0;
const product_model_1 = __importDefault(require("../model/product_model"));
const like_model_1 = __importDefault(require("../model/like_model"));
const comment_model_1 = __importDefault(require("../model/comment_model"));
const like_service_1 = require("../services/like_service");
const error_handler_1 = require("../middleware/error_handler");
const add_product = async function (req, res, next) {
    try {
        //use req.user from auth
        //this is the same as req.user in JavaScript but with type safety
        const user = req.user;
        if (!user) {
            return next((0, error_handler_1.bad_request)("User not authenticate to do this operation"));
        }
        //TODO: Later add in req.user for only authenticated user
        const newProduct = new product_model_1.default({
            product_title: req.body.product_title,
            product_description: req.body.product_description,
            product_price: req.body.product_price,
            product_quantity: req.body.product_quantity,
            product_image: req.body.product_image,
            product_category: req.body.product_category,
            product_user: user._id,
        });
        await newProduct.save();
        return res
            .status(200)
            .json({ success: true, data: newProduct, message: "Product Added" });
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
exports.add_product = add_product;
const list_all_product = async function (req, res, next) {
    try {
        const user_id = req.user ? String(req.user._id) : "";
        const products = await product_model_1.default.find({})
            .populate("product_user", "user_username user_email")
            .lean();
        const productIds = products.map(p => p._id);
        if (productIds.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                message: "List All Products"
            });
        }
        // LIKE COUNTS
        const likeCounts = await like_model_1.default.aggregate([
            { $match: { product: { $in: productIds } } },
            { $group: { _id: "$product", total: { $sum: 1 } } }
        ]);
        const likeMap = {};
        likeCounts.forEach(item => {
            likeMap[String(item._id)] = item.total || 0;
        });
        // COMMENT COUNTS
        const commentCounts = await comment_model_1.default.aggregate([
            { $match: { product: { $in: productIds } } },
            { $group: { _id: "$product", total: { $sum: 1 } } }
        ]);
        const commentMap = {};
        commentCounts.forEach(item => {
            commentMap[String(item._id)] = item.total || 0;
        });
        // USER LIKE STATUS
        const userLikedSet = new Set();
        if (user_id) {
            const userLikes = await like_model_1.default.find({
                user: user_id,
                product: { $in: productIds }
            }).lean();
            userLikes.forEach(like => {
                userLikedSet.add(String(like.product));
            });
        }
        // FINAL RESPONSE
        const finalProducts = products.map(p => ({
            ...p,
            like_count: likeMap[String(p._id)] || 0,
            comment_count: commentMap[String(p._id)] || 0,
            liked_by_user: userLikedSet.has(String(p._id))
        }));
        return res.status(200).json({
            success: true,
            data: finalProducts,
            message: "List All Products"
        });
    }
    catch (err) {
        if (err.name === "ValidationError")
            return next((0, error_handler_1.bad_request)(err.message));
        return next((0, error_handler_1.internal)(err.message));
    }
};
exports.list_all_product = list_all_product;
const list_single_product = async function (req, res, next) {
    try {
        const user_id = req.user ? String(req.user._id) : "";
        const product_id = req.params.id;
        if (!product_id) {
            return next((0, error_handler_1.not_found)(`Cannot find product_id: ${product_id}`));
        }
        const product = await product_model_1.default.findById(product_id)
            .populate("product_user", "user_username user_email")
            .lean();
        if (!product) {
            return next((0, error_handler_1.not_found)("Product not found"));
        }
        const like_count = await (0, like_service_1.get_product_like_count)(product_id);
        const comment_count = await comment_model_1.default.countDocuments({ product: product_id });
        let liked_by_user = false;
        if (user_id) {
            liked_by_user = !!(await (0, like_service_1.user_liked_product)(user_id, product_id));
        }
        return res.status(200).json({
            success: true,
            data: {
                ...product,
                like_count,
                comment_count,
                liked_by_user
            },
            message: "List Single Product"
        });
    }
    catch (err) {
        if (err.name === "ValidationError")
            return next((0, error_handler_1.bad_request)(err.message));
        return next((0, error_handler_1.internal)(err.message));
    }
};
exports.list_single_product = list_single_product;
