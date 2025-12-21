import express from "express";
const router = express.Router();

import { create_seller_profile, get_seller_profile, get_stats, get_status } from "../controller/seller_controller";
import { require_auth } from "../middleware/require_auth";

router.post("/create/seller/profile", require_auth, create_seller_profile);
router.get("/get/seller/profile", require_auth, get_seller_profile);
router.get('/get/seller/status', require_auth, get_status)
router.get('/get/seller/stats', require_auth, get_stats)

export default router;
