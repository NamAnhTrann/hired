"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_comment_like_count = get_comment_like_count;
exports.get_product_like_count = get_product_like_count;
exports.user_liked_comment = user_liked_comment;
exports.user_liked_product = user_liked_product;
const like_model_1 = __importDefault(require("../model/like_model"));
async function get_comment_like_count(comment_id) {
    return like_model_1.default.countDocuments({ comment: comment_id });
}
async function get_product_like_count(product_id) {
    return like_model_1.default.countDocuments({ product: product_id });
}
//display notification
async function user_liked_comment(user_id, comment_id) {
    return like_model_1.default.exists({ user: user_id, comment: comment_id });
}
async function user_liked_product(user_id, product_id) {
    return like_model_1.default.exists({ user: user_id, product: product_id });
}
