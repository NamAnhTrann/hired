import mongoose from "mongoose";

const cart_item_schema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  cart_quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"],
    max: [50, "Quantity too large"],
  },
});

const cart_schema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // unique: true,
    },

    item: {
      type: [cart_item_schema],
    },

    cart_subtotal: {
      type: Number,
      default: 0,
      min: [0, "ttoal price cannot be negative"],
    },
  },
  { timestamps: true }
);


export default mongoose.model("Cart", cart_schema);
