import mongoose from "mongoose";

let user_schema = new mongoose.Schema({
  user_username: {
    type: String,
    required: false,
  },

  user_email: {
    type: String,
    required: true,
    unique:true
  },

  user_phone_number: {
    type: String,
    required: false,
  },

  user_password: {
    type: String,
    required: true,
  },

  user_last_name: {
    type: String,
    required: false,
  },

  user_first_name: {
    type: String,
    required: false,
  },

  user_profile: {
    type: String,
    required: false,
  },
  user_shipping_address: {
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    postcode: { type: String, default: "" },
    country: { type: String, default: "" },
  },
});

export default mongoose.model("User", user_schema);
