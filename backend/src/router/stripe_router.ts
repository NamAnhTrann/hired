import express from "express";
import { require_auth } from "../middleware/require_auth";
import {
  create_stripe_account,
  create_stripe_onboard_link,
  check_stripe_status,
} from "../controller/stripe_controller";

const router = express.Router();

router.post("/create-account", require_auth, create_stripe_account);
router.post("/onboarding-link", require_auth, create_stripe_onboard_link);
router.get("/status", require_auth, check_stripe_status);

export default router;
