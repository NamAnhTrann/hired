"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
//TODO: Add validations
let contact_schema = new mongoose_1.default.Schema({
    contact_last_name: {
        type: String,
        required: true
    },
    contact_first_name: {
        type: String,
        required: true
    },
    contact_email: {
        type: String,
        required: true
    },
    contact_phone_number: {
        type: String,
        required: true
    },
    contact_type: {
        type: String,
        enum: ["general", "payment", "account"]
    },
    contact_message: {
        type: String,
        required: true
    },
    contact_support_file: {
        type: String,
        required: false
    }
});
exports.default = mongoose_1.default.model("Contact", contact_schema);
