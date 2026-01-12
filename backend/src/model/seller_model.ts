import mongoose from "mongoose";

const seller_schema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
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
  },
  { timestamps: true }
);
export default mongoose.model("Seller", seller_schema);