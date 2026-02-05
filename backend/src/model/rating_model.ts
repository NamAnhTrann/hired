import mongoose from "mongoose";

const rating_schema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  stars: {
    type:Number, 
    min: 0, 
    max: 5,
  },

  ic: {
    type:Number, 
    min:0,
    max:10,
  },
},
{timestamps:true});

//make sure rating per product
rating_schema.index({product:1, user: 1}, {unique:true});

export default mongoose.model("Rating", rating_schema);