"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.list_trending = exports.add_trending_item = void 0;
const product_model_1 = __importDefault(require("../model/product_model"));
const error_handler_1 = require("../middleware/error_handler");
const trending_model_1 = __importDefault(require("../model/trending_model"));
const add_trending_item = async function (req, res, next) {
    try {
        const user_id = req.user._id;
        const { product_id } = req.body;
        if (!user_id) {
            return next((0, error_handler_1.unauthorized)("Unauthorised"));
        }
        // Validate input
        if (!product_id) {
            return next((0, error_handler_1.bad_request)("Product ID is required"));
        }
        // Ensure product exists
        const product = await product_model_1.default.findById(product_id);
        if (!product) {
            return next((0, error_handler_1.not_found)("Product not found"));
        }
        // Create trending item
        const new_trending = new trending_model_1.default({
            product: product_id,
            added_at: new Date(),
        });
        await new_trending.save();
        return res.status(201).json({
            message: "Trending item added",
            trending: new_trending,
        });
    }
    catch (err) {
        return next((0, error_handler_1.bad_request)(err.message));
    }
};
exports.add_trending_item = add_trending_item;
const list_trending = async function (req, res, next) {
    try {
        const trending = await trending_model_1.default.find({}).populate("product");
        return res.json({
            success: true,
            data: trending,
            message: "trending listed",
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
exports.list_trending = list_trending;
