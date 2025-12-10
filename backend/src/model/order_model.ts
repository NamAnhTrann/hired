import mongoose from "mongoose";

const order_schema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    cart_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      required: true,
    },

    //hold a snapshot of cart items
    order_item: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
          validate: {
            validator: (v: any) => mongoose.Types.ObjectId.isValid(v),
            message: "Invalid product reference",
          },
        },

        order_quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },

        subtotal: {
          type: Number,
          required: true,
          min: [0, "Price cannot be negative"],
        },
      },
    ],

    order_total_amount: {
      type: String,
      required: true,
      min: [0, "Price can't be negative"],
    },
    order_status: {
      type: String,
      enum: ["pending", "paid", "cancelled", "failed_out_of_stock", "shipped"],
      default: "pending",
    },

    shipping_address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postcode: { type: String, required: true },
      country: { type: String, required: true },
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
    //Neat trick: since we dont have seller/buyer roles, we can use system level as enum
    cancelled_by: {
      type: String,
      enum: ["customer", "system", null],
      default: null,
    },

    cancelled_at: {
      type: Date,
      default: null,
    },

    // payment_id: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Payment",
    //   required: false,
    //   validate: {
    //     validator: (v: any) => !v || mongoose.Types.ObjectId.isValid(v),
    //     message: "Invalid payment reference",
    //   },
    // },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", order_schema);
