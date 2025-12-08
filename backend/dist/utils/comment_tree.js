"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comment_tree = comment_tree;
exports.delete_comment_tree = delete_comment_tree;
const like_model_1 = __importDefault(require("../model/like_model"));
const comment_model_1 = __importDefault(require("../model/comment_model"));


async function comment_tree(comments, current_user_id) {
    const lookup = {};
    const roots = [];
    // Map each comment
    for (const comment of comments) {
        const id = String(comment._id);
        lookup[id] = {
            ...comment,
            replies: [],
            like_count: 0,
            liked_by_user: false
        };
    }
    // Aggregate like counts
    const likeCounts = await like_model_1.default.aggregate([
        { $match: { comment: { $in: comments.map(c => c._id) } } },
        { $group: { _id: "$comment", total: { $sum: 1 } } }
    ]);
    likeCounts.forEach(item => {
        const id = String(item._id);
        if (lookup[id]) {
            lookup[id].like_count = item.total;
        }
    });
    // User-liked detection
    if (current_user_id) {
        const userLikes = await like_model_1.default.find({
            user: current_user_id,
            comment: { $in: comments.map(c => c._id) }
        }).lean();
        userLikes.forEach(like => {
            const id = String(like.comment);
            if (lookup[id]) {
                lookup[id].liked_by_user = true;
            }
        });
    }
    // Build tree
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
    const replies = await comment_model_1.default.find({ parent_comment: comment_id }).lean();
    for (const reply of replies) {
        await delete_comment_tree(String(reply._id));
    }
    await comment_model_1.default.findByIdAndDelete(comment_id);
}
