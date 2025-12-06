import mongoose from "mongoose";

const comment_schema = new mongoose.Schema(
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
    },

    text: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 500
    },

    parent_comment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment",
        default:null,
    }

  },
  {
    timestamps: true 
  }
);

export default mongoose.model("Comment", comment_schema);
