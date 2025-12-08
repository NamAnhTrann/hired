"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
let product_schema = new mongoose_1.default.Schema({
    product_title: {
        type: String,
        required: true
    },
    product_description: {
        type: String,
        required: false
    },
    product_price: {
        type: Number,
        required: true,
    },
    product_quantity: {
        type: Number,
        required: true
    },
    product_image: {
        type: [String], //arrays of iamges
        required: false
    },
    product_category: {
        type: String,
        enum: ["clothing", "digital", "electronic", "food", "other"]
    },
    //each user if choose to sell, will hold their own products
    product_user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});
exports.default = mongoose_1.default.model("Product", product_schema);
