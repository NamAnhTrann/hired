import express from "express";
const router = express.Router();

import {
  create_order,
  list_order,
  create_checkout,
  get_pending_order,
  // cancel_order_system,
  // cancel_order_customer
} from "../controller/order_controller";

import { require_auth } from "../middleware/require_auth";
router.post("/order/create", require_auth, create_order);
router.get("/order/list", require_auth, list_order);
router.post("/order/checkout", require_auth, create_checkout);
router.get("/order/get/pending", require_auth, get_pending_order)

//consider PATCH
// router.put(
//   "/order/cancel/:order_id",
//   require_auth,
//   cancel_order_customer
// );
// router.put(
//   "/order/system-cancel/:order_id",
//   require_auth,
//   cancel_order_system
// );

export default router;
