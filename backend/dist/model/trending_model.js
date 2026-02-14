"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const trending_schema = new mongoose_1.default.Schema({
    product: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
        unique: true
    },
    added_at: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });
exports.default = mongoose_1.default.model("Trending", trending_schema);
