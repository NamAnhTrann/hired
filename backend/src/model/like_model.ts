// model/like_model.ts
import mongoose from "mongoose";

const like_schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null
    },

    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null
    }
  },
  { timestamps: true }
);
 like_schema.index({ user: 1, product: 1 }, { unique: true });
 like_schema.index({ user: 1, comment: 1 }, { unique: true });

export default mongoose.model("Like", like_schema);
