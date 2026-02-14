"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const order_schema = new mongoose_1.default.Schema({
    user_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    cart_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Cart",
        required: true,
    },
    //hold a snapshot of cart items
    order_item: [
        {
            product_id: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
                validate: {
                    validator: (v) => mongoose_1.default.Types.ObjectId.isValid(v),
                    message: "Invalid product reference",
                },
            },
            order_quantity: {
                type: Number,
                required: true,
                min: [1, "Quantity must be at least 1"],
            },
            subtotal: {
                type: Number,
                required: true,
                min: [0, "Price cannot be negative"],
            },
        },
    ],
    order_total_amount: {
        type: Number,
        required: true,
        min: [0, "Price can't be negative"],
    },
    order_status: {
        type: String,
        enum: ["pending", "paid", "cancelled", "failed_out_of_stock", "shipped"],
        default: "pending",
    },
    vat_amount: {
        type: Number,
        required: true,
        min: 0,
    },
    shipping_address: {
        street: String,
        city: String,
        state: String,
        postcode: String,
        country: String,
    },
    //Neat trick: since we dont have seller/buyer roles, we can use system level as enum
    cancelled_by: {
        type: String,
        enum: ["customer", "system", null],
        default: null,
    },
    cancelled_at: {
        type: Date,
        default: null,
    },
    // payment_id: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Payment",
    //   required: false,
    //   validate: {
    //     validator: (v: any) => !v || mongoose.Types.ObjectId.isValid(v),
    //     message: "Invalid payment reference",
    //   },
    // },
}, {
    timestamps: true,
});
order_schema.index({ user_id: 1 }, { unique: true, partialFilterExpression: { order_status: "pending" } });
exports.default = mongoose_1.default.model("Order", order_schema);
