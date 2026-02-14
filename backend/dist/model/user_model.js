"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const user_schema = new mongoose_1.default.Schema({
    user_username: String,
    user_email: { type: String, required: true, unique: true },
    user_phone_number: String,
    user_password: { type: String, required: true },
    user_first_name: String,
    user_last_name: String,
    user_profile: String,
    user_shipping_address: {
        street: String,
        city: String,
        state: String,
        postcode: String,
        country: String,
    },
}, { timestamps: true });
exports.default = mongoose_1.default.model("User", user_schema);
