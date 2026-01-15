import { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
import {
  bad_request,
  internal,
  not_found,
  unauthorized,
} from "../middleware/error_handler";
import Seller from "../model/seller_model";

export const create_stripe_account = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as any;

    let seller = await Seller.findOne({ user_id: user._id });

    if (!seller) {
      return next(bad_request("Seller profile not created"));
    }

    if (seller.stripe_account_id) {
      console.log(
        "[Stripe] Existing seller account:",
        seller.stripe_account_id
      );
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
  } catch (err: any) {
    console.error("[Stripe] Create account error:", err);
    return next(internal(err.message));
  }
};

//onboard link
export const create_stripe_onboard_link = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as any;

    const seller = await Seller.findOne({ user_id: user._id });
    if (!seller || !seller.stripe_account_id) {
      return next(bad_request("Stripe account not created"));
    }

    const link = await stripe.accountLinks.create({
      account: seller.stripe_account_id,
      refresh_url: "http://localhost:4200/stripe/refresh",
      return_url: "http://localhost:4200/stripe/success",
      type: "account_onboarding",
    });

    console.log("[Stripe] Onboarding link created:", seller.stripe_account_id);

    return res.json({ url: link.url });
  } catch (err: any) {
    console.error("[Stripe] Onboarding error:", err);
    return next(internal(err.message));
  }
};

//status check
export const check_stripe_status = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as any;

    const seller = await Seller.findOne({ user_id: user._id });
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
  } catch (err: any) {
    console.error("[Stripe] Status check error:", err);
    return next(internal(err.message));
  }
};
