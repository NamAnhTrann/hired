"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
let product_schema = new mongoose_1.default.Schema({
    product_title: {
        type: String,
        required: true,
    },
    product_description: {
        type: String,
        required: false,
    },
    product_price: {
        type: Number,
        required: true,
    },
    product_quantity: {
        type: Number,
        required: true,
    },
    product_image: {
        type: [String], //arrays of iamges
        required: true,
    },
    product_category: {
        type: String,
        enum: ["clothing", "digital", "electronic", "other", "food"],
    },
    //each user if choose to sell, will hold their own products
    product_user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    product_view_count: {
        type: Number,
        default: 0,
    },
    product_features: {
        type: [String],
        default: [],
    },
    shipping_info: {
        type: [String],
        default: [],
    },
    product_policies: {
        type: [String],
        default: [],
    },
    product_user_rating_sum: {
        type: Number,
        default: 0,
    },
    product_user_rating_count: {
        type: Number,
        default: 0,
    },
    product_ic_rating_sum: {
        type: Number,
        default: 0,
    },
    product_ic_rating_count: {
        type: Number,
        default: 0,
    },
});
product_schema.index({
    product_title: "text",
    product_description: "text",
    product_features: "text",
    product_category: "text",
}, {
    default_language: 'none',
    weights: {
        product_title: 10,
        product_features: 6,
        product_description: 3,
        product_category: 2,
    },
    name: "ProductTextIndex",
});
exports.default = mongoose_1.default.model("Product", product_schema);
