"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const require_auth_1 = require("../middleware/require_auth");
const stripe_controller_1 = require("../controller/stripe_controller");
const router = express_1.default.Router();
router.post("/create-account", require_auth_1.require_auth, stripe_controller_1.create_stripe_account);
router.post("/onboarding-link", require_auth_1.require_auth, stripe_controller_1.create_stripe_onboard_link);
router.get("/status", require_auth_1.require_auth, stripe_controller_1.check_stripe_status);
exports.default = router;
