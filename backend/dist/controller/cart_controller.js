"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delete_per_item_cart = exports.list_cart = exports.add_cart = void 0;
const product_model_1 = __importDefault(require("../model/product_model"));
const cart_model_1 = __importDefault(require("../model/cart_model"));
const error_handler_1 = require("../middleware/error_handler");
const add_cart = async function (req, res, next) {
    try {
        const user_id = req.user?._id;
        if (!user_id) {
            return next((0, error_handler_1.unauthorized)("Unauthorised"));
        }
        const { product_id, quantity } = req.body;
        if (!product_id || !quantity) {
            return next((0, error_handler_1.bad_request)("Missing product_id or quantity"));
        }
        // Check product exists
        const product = await product_model_1.default.findById(product_id);
        if (!product) {
            return next((0, error_handler_1.not_found)("Product not found"));
        }
        // Find user's cart or create new one
        let cart = await cart_model_1.default.findOne({ user_id });
        if (!cart) {
            cart = new cart_model_1.default({
                user_id,
                item: [],
                cart_subtotal: 0,
            });
        }
        // Check if item already exists in cart
        const existing_item = cart.item.find(function (item) {
            return item.product_id.toString() === product_id;
        });
        if (existing_item) {
            existing_item.cart_quantity += quantity;
        }
        else {
            cart.item.push({
                product_id: product_id,
                cart_quantity: quantity,
            });
        }
        // Recalculate subtotal
        let total = 0;
        for (const item of cart.item) {
            const products = await product_model_1.default.findById(item.product_id);
            if (!products) {
                return next((0, error_handler_1.bad_request)("Products cant be found"));
            }
            total += products.product_price * item.cart_quantity;
        }
        cart.cart_subtotal = total;
        await cart.save();
        return res.status(200).json({
            success: true,
            message: "Cart updated",
            data: cart,
        });
    }
    catch (err) {
        if (err.name === "ValidationError") {
            return next((0, error_handler_1.bad_request)(err.message));
        }
        return next((0, error_handler_1.internal)(err.message));
    }
};
exports.add_cart = add_cart;
const list_cart = async function (req, res, next) {
    try {
        const user = req.user._id;
        if (!user) {
            return next((0, error_handler_1.unauthorized)("Unauthorised"));
        }
        const cart = await cart_model_1.default.findOne({ user_id: user }).populate("item.product_id", "product_title product_description product_price product_image product_category");
        if (!cart) {
            return next((0, error_handler_1.not_found)("cart cannot be found"));
        }
        return res
            .status(200)
            .json({ data: cart, success: true, message: "cart listed" });
    }
    catch (err) {
        if (err.name === "ValidationError") {
            return next((0, error_handler_1.bad_request)(err.message));
        }
        return next((0, error_handler_1.internal)(err.message));
    }
};
exports.list_cart = list_cart;
const delete_per_item_cart = async function (req, res, next) {
    try {
        const user = req.user._id;
        const { product_id } = req.params;
        if (!user) {
            return next((0, error_handler_1.unauthorized)("Unauthorised"));
        }
        if (!product_id) {
            return next((0, error_handler_1.not_found)("Cant find product id"));
        }
        const cart = await cart_model_1.default.findOne({ user_id: user });
        if (!cart) {
            return next((0, error_handler_1.not_found)("Cant find cart"));
        }
        const item_index = cart.item.findIndex((item) => item.product_id.toString() === product_id);
        if (item_index === -1) {
            return next((0, error_handler_1.bad_request)("item not found in cart"));
        }
        //remove item from cart (per item in cart)
        cart.item.splice(item_index, 1);
        //recalc price
        let total = 0;
        for (const item of cart.item) {
            const products = await product_model_1.default.findById(item.product_id);
            if (!products) {
                return next((0, error_handler_1.bad_request)("Products cant be found"));
            }
            total += products.product_price * item.cart_quantity;
        }
        cart.cart_subtotal = total;
        await cart.save();
        const update_cart = await cart_model_1.default.findById(cart._id).populate("item.product_id", "product_title product_description product_price product_image product_category");
        return res
            .status(200)
            .json({ data: update_cart, success: true, message: "item removed" });
    }
    catch (err) {
        if (err.name === "ValidationError") {
            return next((0, error_handler_1.bad_request)(err.message));
        }
        return next((0, error_handler_1.internal)(err.message));
    }
};
exports.delete_per_item_cart = delete_per_item_cart;
