"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delete_comment = exports.list_comment = exports.add_comment = void 0;
exports.reply_comment = reply_comment;
const comment_model_1 = __importDefault(require("../model/comment_model"));
const product_model_1 = __importDefault(require("../model/product_model"));
const comment_tree_1 = require("../utils/comment_tree");
const error_handler_1 = require("../middleware/error_handler");
const add_comment = async function (req, res, next) {
    try {
        const user = req.user;
        if (!user) {
            return next((0, error_handler_1.unauthorized)("Must be logged in to comment"));
        }
        const { product_id, text } = req.body;
        if (!product_id || !text) {
            return next((0, error_handler_1.bad_request)("Missing product id or text"));
        }
        const product = await product_model_1.default.findById(product_id);
        if (!product) {
            return next((0, error_handler_1.not_found)("Product not found"));
        }
        //create comment objects
        const new_comment = new comment_model_1.default({
            product: product_id,
            user: user._id,
            text: text,
        });
        //save and return
        await new_comment.save();
        await new_comment.populate("user", "user_username");
        return res
            .status(200)
            .json({ message: "Commend is added", success: true, data: new_comment });
    }
    catch (err) {
        //this will handle errors from Schemas
        if (err.name === "ValidationError") {
            return next((0, error_handler_1.bad_request)(err.message));
        }
        //call the error handler
        return next((0, error_handler_1.internal)("Failed to add contact"));
    }
};
exports.add_comment = add_comment;
//reply to comments
async function reply_comment(req, res, next) {
    try {
        const { product_id, parent_comment, text } = req.body;
        // Validate input
        if (!product_id || !parent_comment || !text) {
            return next((0, error_handler_1.bad_request)("Missing fields for reply"));
        }
        const newReply = await comment_model_1.default.create({
            product: product_id,
            parent_comment: parent_comment,
            text: text,
            user: req.user._id,
        });
        return res.status(200).json({
            success: true,
            data: newReply,
            message: "Reply added",
        });
    }
    catch (err) {
        return next((0, error_handler_1.internal)(err.message));
    }
}
//list all the comments
const list_comment = async function (req, res, next) {
    try {
        const product_id = req.params.product_id;
        if (!product_id) {
            return next((0, error_handler_1.bad_request)("Missing product id"));
        }
        // Check if product exists
        const product = await product_model_1.default.findById(product_id);
        if (!product) {
            return next((0, error_handler_1.not_found)("Product not found"));
        }
        // Fetch all comments for this product
        const comments = await comment_model_1.default.find({ product: product_id })
            .populate("user", "user_username user_email")
            .sort({ createdAt: -1 })
            .lean();
        // Build nested comment structure (NO likes)
        const nested_comments = await (0, comment_tree_1.comment_tree)(comments);
        return res.status(200).json({
            success: true,
            data: nested_comments,
            message: "List of comments",
        });
    }
    catch (err) {
        if (err.name === "ValidationError") {
            return next((0, error_handler_1.bad_request)(err.message));
        }
        return next((0, error_handler_1.internal)(err.message));
    }
};
exports.list_comment = list_comment;
const delete_comment = async function (req, res, next) {
    try {
        const user = req.user;
        if (!user) {
            return next((0, error_handler_1.unauthorized)("Must be login"));
        }
        const comment_id = req.params.id;
        if (!comment_id) {
            return next((0, error_handler_1.bad_request)("Missing comment id"));
        }
        const comment = await comment_model_1.default.findById(comment_id);
        if (!comment) {
            return res.status(200).json({
                success: true,
                message: "Already deleted"
            });
        }
        if (comment.user.toString() !== (user._id || user.id).toString()) {
            return next((0, error_handler_1.unauthorized)("Cannot delete someone else comment"));
        }
        await (0, comment_tree_1.delete_comment_tree)(comment_id);
        return res.status(200).json({
            success: true,
            message: "Comment and its replies deleted",
        });
    }
    catch (err) {
        //this will handle errors from Schemas
        if (err.name === "ValidationError") {
            return next((0, error_handler_1.bad_request)(err.message));
        }
        //call the error handler
        return next((0, error_handler_1.internal)("Failed to add comment"));
    }
};
exports.delete_comment = delete_comment;
