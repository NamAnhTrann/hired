"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comment_tree = comment_tree;
exports.delete_comment_tree = delete_comment_tree;
const comment_model_1 = __importDefault(require("../model/comment_model"));
async function comment_tree(comments) {
    const lookup = {};
    const roots = [];
    //Map each comment
    for (const comment of comments) {
        const id = String(comment._id);
        lookup[id] = {
            ...comment,
            replies: []
        };
    }
    //Build tree
    for (const comment of comments) {
        const id = String(comment._id);
        const parentId = comment.parent_comment
            ? String(comment.parent_comment)
            : null;
        if (parentId && lookup[parentId]) {
            lookup[parentId].replies.push(lookup[id]);
        }
        else {
            roots.push(lookup[id]);
        }
    }
    return roots;
}
async function delete_comment_tree(comment_id) {
    const comment = await comment_model_1.default.findById(comment_id).lean();
    if (!comment)
        return;
    // ind replies
    const replies = await comment_model_1.default.find({ parent_comment: comment_id }).lean();
    //delete children first
    for (const reply of replies) {
        await delete_comment_tree(String(reply._id));
    }
    //delete main comment
    await comment_model_1.default.findByIdAndDelete(comment_id);
}
