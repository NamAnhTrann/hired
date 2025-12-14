import express from "express";
const router = express.Router();

import { Request, Response } from "express";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
import Order from "../model/order_model";
import Cart from "../model/cart_model";
import Product from "../model/product_model";

router.post(
  "/webhook",
  async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string;

    let event: Stripe.Event;

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
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status !== "paid") {
        return res.status(200).send("IGNORED");
      }

      const order_id = session.metadata?.order_id;
      if (!order_id) {
        return res.status(400).send("ORDER_ID_MISSING");
      }

      const order = await Order.findById(order_id).populate(
        "order_item.product_id"
      );

      if (!order) {
        return res.status(404).send("Order not found");
      }

      // Idempotency: ignore repeated webhook calls
      if (order.order_status !== "pending") {
        return res.status(200).send("OK");
      }

      // Verify payment amount (Stripe sends cents)
      if (session.amount_total !== order.order_total_amount) {
        return res.status(400).send("AMOUNT_MISMATCH");
      }

      // Atomic stock check + deduction
      for (const item of order.order_item) {
        const productId =
          typeof item.product_id === "object"
            ? (item.product_id as any)._id
            : item.product_id;

        const updatedProduct = await Product.findOneAndUpdate(
          {
            _id: productId,
            product_quantity: { $gte: item.order_quantity },
          },
          {
            $inc: { product_quantity: -item.order_quantity },
          },
          { new: true }
        );

        if (!updatedProduct) {
          // Refund if stock insufficient
          await stripe.refunds.create({
            payment_intent: session.payment_intent as string,
          });

          order.order_status = "failed_out_of_stock";
          await order.save();

          return res.status(200).send("REFUNDED_OUT_OF_STOCK");
        }
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
      const intent = event.data.object as Stripe.PaymentIntent;
      const order_id = intent.metadata?.order_id;

      if (!order_id) {
        return res.status(200).send("OK");
      }

      const order = await Order.findById(order_id);
      if (!order) {
        return res.status(200).send("OK");
      }

      if (order.order_status === "pending") {
        order.order_status = "cancelled";
        await order.save();
      }

      return res.status(200).send("OK");
    }

    return res.status(200).send("IGNORED");
  }
);

export default router;
