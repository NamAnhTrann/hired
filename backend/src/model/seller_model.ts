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

    store_rating: {
      type: Number,
      default: 0,
    },

    store_logo: {
      type: String,
      required: true,
    },

    store_banner: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1920&h=600&q=80",
    },
    store_total_sale: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);
export default mongoose.model("Seller", seller_schema);
