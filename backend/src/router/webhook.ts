import express from "express";
const router = express.Router();
import { Request, Response } from "express";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

import bodyParser from "body-parser";
import Order from "../model/order_model";
import Cart from "../model/cart_model";
import Product from "../model/product_model";

router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string;

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;

      if (session.payment_status !== "paid") {
        return res.status(200).send("IGNORED");
      }

      const order_id = session.metadata.order_id;
      const order = await Order.findById(order_id).populate(
        "order_item.product_id"
      );

      if (!order) {
        return res.status(404).send("Order not found");
      }

      // If already processed, ignore
      if (order.order_status === "paid") {
        return res.status(200).send("OK");
      }

      // Try deduct stock 
      for (const item of order.order_item) {
        const prod = await Product.findById(item.product_id);
        if (!prod) continue;

        if (prod.product_quantity < item.order_quantity) {
          // Not enough stock: refund instantly
          await stripe.refunds.create({
            payment_intent: session.payment_intent,
          });

          order.order_status = "failed_out_of_stock";
          await order.save();

          return res.status(200).send("REFUNDED_OUT_OF_STOCK");
        }
      }

      // Deduct stock 
      for (const item of order.order_item) {
        const prod = await Product.findById(item.product_id);
        if (!prod) continue;

        prod.product_quantity -= item.order_quantity;
        await prod.save();
      }

      // Mark order as paid
      order.order_status = "paid";
      await order.save();

      // Clear cart
      await Cart.findByIdAndUpdate(order.cart_id, {
        item: [],
        cart_subtotal: 0,
      });

      return res.status(200).send("OK");
    }

    if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object as any;
      const order_id = intent.metadata.order_id;

      const order = await Order.findById(order_id);
      if (!order) return res.status(200).send("OK");

      order.order_status = "cancelled";
      await order.save();

      return res.status(200).send("OK");
    }

    return res.status(200).send("IGNORED");
  }
);


export default router;
