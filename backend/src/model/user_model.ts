import mongoose from "mongoose";

const user_schema = new mongoose.Schema(
  {
    user_username: String,
    user_email: { type: String, required: true, unique: true },
    user_phone_number: String,
    user_password: { type: String, required: true },
    user_first_name: String,
    user_last_name: String,
    user_profile: String,

    user_shipping_address: {
      street: String,
      city: String,
      state: String,
      postcode: String,
      country: String,
    },
  },
  { timestamps: true }
);
export default mongoose.model("User", user_schema);