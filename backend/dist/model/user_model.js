"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
let user_schema = new mongoose_1.default.Schema({
    user_username: {
        type: String,
        required: false
    },
    user_email: {
        type: String,
        required: true,
    },
    user_phone_number: {
        type: String,
        required: false
    },
    user_password: {
        type: String,
        required: true
    },
    user_last_name: {
        type: String,
        required: false,
    },
    user_first_name: {
        type: String,
        required: false,
    },
    user_profile: {
        type: String,
        required: false
    }
});
exports.default = mongoose_1.default.model("User", user_schema);
