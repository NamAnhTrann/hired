import express from "express";
const router = express.Router();

import { create_seller_profile, get_seller_profile, get_status } from "../controller/seller_controller";
import { optional_auth, require_auth } from "../middleware/require_auth";

router.post("/create/seller/profile/", require_auth, create_seller_profile);
router.get("/get/seller/profile/", require_auth, get_seller_profile);
router.get('/get/seller/status/', require_auth, get_status)

export default router;
