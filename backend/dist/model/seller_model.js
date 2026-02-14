"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const seller_schema = new mongoose_1.default.Schema({
    user_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    store_name: {
        type: String,
        required: true,
        trim: true,
    },
    store_description: {
        type: String,
        required: true,
    },
    store_address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postcode: { type: String, required: true },
        country: { type: String, required: true },
    },
    stripe_account_id: {
        type: String,
        default: null,
        index: true,
    },
    stripe_onboarded: {
        type: Boolean,
        default: false,
    },
    stripe_charges_enabled: {
        type: Boolean,
        default: false,
    },
    stripe_payouts_enabled: {
        type: Boolean,
        default: false,
    },
    seller_status: {
        type: String,
        enum: ["pending", "active", "suspended"],
        default: "pending",
    },
    seller_badges: {
        type: [String],
        default: [],
    },
    store_rating: {
        type: Number
    },
    store_profile: {
        type: String,
        required: true
    },
    store_banner: {
        type: String
    },
    store_total_sale: {
        type: Number,
        default: 0
    }
}, { timestamps: true });
exports.default = mongoose_1.default.model("Seller", seller_schema);
