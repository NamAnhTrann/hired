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

    //entry point for shipping
    store_address: {
      street: { type: String, required: true, default: "" },
      city: { type: String, required: true, default: "" },
      state: { type: String, required: true, default: "" },
      postcode: { type: String, required: true, default: "" },
      country: { type: String, required: true, default: "" },
    },

    stripe_account_id: {
      type: String,
      default: "",
    },

    stripe_onboarded: {
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
      enum: [
        "trusted_seller",
        "top_rated",
        "veteran",
        "high_volume",
        "responsive_seller",
        "quality_products",
      ],
      default: [],
    },
  },
  { timestamps: true }
);
export default mongoose.model("Seller", seller_schema);
