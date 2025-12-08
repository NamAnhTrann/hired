"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
const body_parser_1 = __importDefault(require("body-parser"));
const order_model_1 = __importDefault(require("../model/order_model"));
const cart_model_1 = __importDefault(require("../model/cart_model"));
const product_model_1 = __importDefault(require("../model/product_model"));
router.post("/webhook", body_parser_1.default.raw({ type: "application/json" }), async (req, res) => {
    const signature = req.headers["stripe-signature"];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    }
    catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        if (session.payment_status !== "paid") {
            return res.status(200).send("IGNORED");
        }
        const order_id = session.metadata.order_id;
        const order = await order_model_1.default.findById(order_id).populate("order_item.product_id");
        if (!order) {
            return res.status(404).send("Order not found");
        }
        // If already processed, ignore
        if (order.order_status === "paid") {
            return res.status(200).send("OK");
        }
        // Try deduct stock 
        for (const item of order.order_item) {
            const prod = await product_model_1.default.findById(item.product_id);
            if (!prod)
                continue;
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
            const prod = await product_model_1.default.findById(item.product_id);
            if (!prod)
                continue;
            prod.product_quantity -= item.order_quantity;
            await prod.save();
        }
        // Mark order as paid
        order.order_status = "paid";
        await order.save();
        // Clear cart
        await cart_model_1.default.findByIdAndUpdate(order.cart_id, {
            item: [],
            cart_subtotal: 0,
        });
        return res.status(200).send("OK");
    }
    if (event.type === "payment_intent.payment_failed") {
        const intent = event.data.object;
        const order_id = intent.metadata.order_id;
        const order = await order_model_1.default.findById(order_id);
        if (!order)
            return res.status(200).send("OK");
        order.order_status = "cancelled";
        await order.save();
        return res.status(200).send("OK");
    }
    return res.status(200).send("IGNORED");
});
exports.default = router;
