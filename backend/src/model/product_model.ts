import mongoose from "mongoose";

let product_schema = new mongoose.Schema({
  product_title: {
    type: String,
    required: true,
  },

  product_description: {
    type: String,
    required: false,
  },

  product_price: {
    type: Number,
    required: true,
  },

  product_quantity: {
    type: Number,
    required: true,
  },

  product_image: {
    type: [String], //arrays of iamges
    required: true,
  },

  product_category: {
    type: String,
    enum: ["clothing", "digital", "electronic", "other", "food"],
  },

  //each user if choose to sell, will hold their own products
  product_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  product_view_count: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model("Product", product_schema);
