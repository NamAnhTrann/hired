"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// model/like_model.ts
const mongoose_1 = __importDefault(require("mongoose"));
const like_schema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    product: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Product",
        default: null
    },
    comment: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    }
}, { timestamps: true });
// Prevent duplicate like from same user
// like_schema.index({ user: 1, product: 1 }, { unique: true });
// like_schema.index({ user: 1, comment: 1 }, { unique: true });
exports.default = mongoose_1.default.model("Like", like_schema);
