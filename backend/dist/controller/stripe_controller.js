"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.check_stripe_status = exports.create_stripe_onboard_link = exports.create_stripe_account = void 0;
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
const error_handler_1 = require("../middleware/error_handler");
const seller_model_1 = __importDefault(require("../model/seller_model"));
const create_stripe_account = async (req, res, next) => {
    try {
        const user = req.user;
        let seller = await seller_model_1.default.findOne({ user_id: user._id });
        if (!seller) {
            return next((0, error_handler_1.bad_request)("Seller profile not created"));
        }
        if (seller.stripe_account_id) {
            console.log("[Stripe] Existing seller account:", seller.stripe_account_id);
            return res.json({ stripe_account_id: seller.stripe_account_id });
        }
        const account = await stripe.accounts.create({
            type: "express",
            email: user.user_email,
        });
        seller.stripe_account_id = account.id;
        await seller.save();
        console.log("[Stripe] New seller Stripe account:", account.id);
        return res.status(201).json({
            stripe_account_id: account.id,
        });
    }
    catch (err) {
        console.error("[Stripe] Create account error:", err);
        return next((0, error_handler_1.internal)(err.message));
    }
};
exports.create_stripe_account = create_stripe_account;
//onboard link
const create_stripe_onboard_link = async (req, res, next) => {
    try {
        const user = req.user;
        const seller = await seller_model_1.default.findOne({ user_id: user._id });
        if (!seller || !seller.stripe_account_id) {
            return next((0, error_handler_1.bad_request)("Stripe account not created"));
        }
        const link = await stripe.accountLinks.create({
            account: seller.stripe_account_id,
            refresh_url: "http://localhost:4200/stripe/refresh",
            return_url: "http://localhost:4200/stripe/success",
            type: "account_onboarding",
        });
        console.log("[Stripe] Onboarding link created:", seller.stripe_account_id);
        return res.json({ url: link.url });
    }
    catch (err) {
        console.error("[Stripe] Onboarding error:", err);
        return next((0, error_handler_1.internal)(err.message));
    }
};
exports.create_stripe_onboard_link = create_stripe_onboard_link;
//status check
const check_stripe_status = async (req, res, next) => {
    try {
        const user = req.user;
        const seller = await seller_model_1.default.findOne({ user_id: user._id });
        if (!seller || !seller.stripe_account_id) {
            return res.json({ onboarded: false });
        }
        const account = await stripe.accounts.retrieve(seller.stripe_account_id);
        seller.stripe_onboarded =
            account.details_submitted && account.charges_enabled;
        seller.stripe_charges_enabled = account.charges_enabled;
        seller.stripe_payouts_enabled = account.payouts_enabled;
        seller.seller_status = seller.stripe_onboarded ? "active" : "pending";
        await seller.save();
        console.log("[Stripe] Seller status synced:", seller.stripe_account_id);
        return res.json({
            onboarded: seller.stripe_onboarded,
            charges_enabled: seller.stripe_charges_enabled,
            payouts_enabled: seller.stripe_payouts_enabled,
        });
    }
    catch (err) {
        console.error("[Stripe] Status check error:", err);
        return next((0, error_handler_1.internal)(err.message));
    }
};
exports.check_stripe_status = check_stripe_status;
