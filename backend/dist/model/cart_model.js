"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const cart_item_schema = new mongoose_1.default.Schema({
    product_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    cart_quantity: {
        type: Number,
        required: true,
        min: [1, "Quantity must be at least 1"],
        max: [50, "Quantity too large"],
    },
});
const cart_schema = new mongoose_1.default.Schema({
    user_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        // unique: true,
    },
    item: {
        type: [cart_item_schema],
    },
    cart_subtotal: {
        type: Number,
        default: 0,
        min: [0, "ttoal price cannot be negative"],
    },
}, { timestamps: true });
exports.default = mongoose_1.default.model("Cart", cart_schema);
