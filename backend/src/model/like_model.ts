import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate likes: a user can like a product only once.
// likeSchema.index({ product: 1, user: 1 }, { unique: true });

export default mongoose.model("Like", likeSchema);
