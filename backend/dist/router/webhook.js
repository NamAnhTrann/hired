"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
const order_model_1 = __importDefault(require("../model/order_model"));
const cart_model_1 = __importDefault(require("../model/cart_model"));
const product_model_1 = __importDefault(require("../model/product_model"));
const seller_model_1 = __importDefault(require("../model/seller_model"));
router.post("/webhook", async (req, res) => {
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
        const order_id = session.metadata?.order_id;
        if (!order_id) {
            return res.status(400).send("ORDER_ID_MISSING");
        }
        const order = await order_model_1.default.findById(order_id).populate("order_item.product_id");
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
            const productId = typeof item.product_id === "object"
                ? item.product_id._id
                : item.product_id;
            const updatedProduct = await product_model_1.default.findOneAndUpdate({
                _id: productId,
                product_quantity: { $gte: item.order_quantity },
            }, {
                $inc: { product_quantity: -item.order_quantity },
            }, { new: true });
            if (!updatedProduct) {
                // Refund if stock insufficient
                await stripe.refunds.create({
                    payment_intent: session.payment_intent,
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
        await cart_model_1.default.findByIdAndUpdate(order.cart_id, {
            item: [],
            cart_subtotal: 0,
        });
        return res.status(200).send("OK");
    }
    if (event.type === "payment_intent.payment_failed") {
        const intent = event.data.object;
        const order_id = intent.metadata?.order_id;
        if (!order_id) {
            return res.status(200).send("OK");
        }
        const order = await order_model_1.default.findById(order_id);
        if (!order) {
            return res.status(200).send("OK");
        }
        if (order.order_status === "pending") {
            order.order_status = "cancelled";
            await order.save();
        }
        return res.status(200).send("OK");
    }
    //onboarding
    if (event.type === "account.updated") {
        const account = event.data.object;
        const seller = await seller_model_1.default.findOne({
            stripe_account_id: account.id,
        });
        if (!seller) {
            return res.status(200).send("SELLER_NOT_FOUND");
        }
        const onboarded = account.details_submitted &&
            account.charges_enabled &&
            account.payouts_enabled;
        seller.stripe_onboarded = onboarded;
        seller.stripe_charges_enabled = account.charges_enabled;
        seller.stripe_payouts_enabled = account.payouts_enabled;
        seller.seller_status = onboarded ? "active" : "pending";
        await seller.save();
        return res.status(200).send("ACCOUNT_UPDATED");
    }
    return res.status(200).send("IGNORED");
});
exports.default = router;
