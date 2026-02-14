"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const rating_schema = new mongoose_1.default.Schema({
    product: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    stars: {
        type: Number,
        min: 0,
        max: 5,
    },
    ic: {
        type: Number,
        min: 0,
        max: 10,
    },
}, { timestamps: true });
//make sure rating per product
rating_schema.index({ product: 1, user: 1 }, { unique: true });
exports.default = mongoose_1.default.model("Rating", rating_schema);
