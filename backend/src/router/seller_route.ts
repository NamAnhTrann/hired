import express from "express";
const router = express.Router();

import {
  create_seller_profile,
  get_seller_from_product,
  get_seller_profile,
  get_stats,
  get_status,
  list_products_by_seller,
  seller_store_page_edit,
} from "../controller/seller_controller";
import { require_auth } from "../middleware/require_auth";

router.post("/create/seller/profile", require_auth, create_seller_profile);
router.get("/get/seller/profile", require_auth, get_seller_profile);
router.get("/get/seller/status", require_auth, get_status);
router.get("/get/seller/stats", require_auth, get_stats);
router.get("/get/seller/from_product/:product_id", get_seller_from_product);
router.get("/by-seller/:userId", list_products_by_seller);
router.patch("/seller/store/profile", require_auth, seller_store_page_edit);

export default router;
