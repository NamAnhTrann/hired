"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unlike = exports.like_comment = exports.like_product = void 0;
const like_model_1 = __importDefault(require("../model/like_model"));
const product_model_1 = __importDefault(require("../model/product_model"));
const comment_model_1 = __importDefault(require("../model/comment_model"));
const error_handler_1 = require("../middleware/error_handler");
const like_product = async function (req, res, next) {
    try {
        const { product_id } = req.body;
        if (!product_id) {
            return next((0, error_handler_1.bad_request)("Missing product Id"));
        }
        const product = await product_model_1.default.findById(product_id);
        if (!product) {
            return next((0, error_handler_1.not_found)("Product not found"));
        }
        const user_id = req.user._id;
        if (!user_id) {
            return next((0, error_handler_1.unauthorized)("Not authorised"));
        }
        const existing = await like_model_1.default.findOne({ user: user_id, product: product_id });
        if (existing) {
            return next((0, error_handler_1.bad_request)("You already liked this product"));
        }
        const like = await like_model_1.default.create({
            user: user_id,
            product: product_id,
        });
        return res
            .status(200)
            .json({ data: like, success: true, message: "Liked product" });
    }
    catch (err) {
        //this will handle errors from Schemas
        if (err.name === "ValidationError") {
            return next((0, error_handler_1.bad_request)(err.message));
        }
        //call the error handler
        return next((0, error_handler_1.internal)(err.message));
    }
};
exports.like_product = like_product;
//like comments
const like_comment = async function like_comment(req, res, next) {
    try {
        const { comment_id } = req.body;
        if (!comment_id)
            return next((0, error_handler_1.bad_request)("Missing comment_id"));
        const comment = await comment_model_1.default.findById(comment_id);
        if (!comment)
            return next((0, error_handler_1.not_found)("Comment not found"));
        const user_id = req.user._id;
        if (!user_id) {
            return next((0, error_handler_1.unauthorized)("Not authorised"));
        }
        // prevent duplicate like
        const existing = await like_model_1.default.findOne({ user: user_id, comment: comment_id });
        if (existing) {
            return next((0, error_handler_1.bad_request)("You already liked this comment"));
        }
        const like = await like_model_1.default.create({
            user: user_id,
            comment: comment_id,
        });
        return res.status(200).json({
            success: true,
            message: "Comment liked",
            data: like,
        });
    }
    catch (err) {
        //this will handle errors from Schemas
        if (err.name === "ValidationError") {
            return next((0, error_handler_1.bad_request)(err.message));
        }
        //call the error handler
        return next((0, error_handler_1.internal)(err.message));
    }
};
exports.like_comment = like_comment;
//unlike comments
const unlike = async function (req, res, next) {
    try {
        const { target_id, type } = req.body;
        if (!target_id || !type) {
            return next((0, error_handler_1.bad_request)("Missing target id or type"));
        }
        const user_id = req.user._id;
        if (!user_id) {
            return next((0, error_handler_1.unauthorized)("Not authorised"));
        }
        const filter = { user: user_id };
        if (type === "product") {
            filter.product = target_id;
        }
        else if (type === "comment") {
            filter.comment = target_id;
        }
        else {
            return next((0, error_handler_1.bad_request)("Invalid Type"));
        }
        const deleted = await like_model_1.default.deleteOne(filter);
        if (deleted.deletedCount === 0) {
            return next((0, error_handler_1.not_found)("Like does not exist"));
        }
        return res.status(200).json({
            success: true,
            message: "unliked",
        });
    }
    catch (err) {
        //this will handle errors from Schemas
        if (err.name === "ValidationError") {
            return next((0, error_handler_1.bad_request)(err.message));
        }
        //call the error handler
        return next((0, error_handler_1.internal)(err.message));
    }
};
exports.unlike = unlike;
