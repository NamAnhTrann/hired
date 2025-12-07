import express from "express";
const router = express.Router();

import {
  create_order,
  list_order,
  create_checkout
} from "../controller/order_controller";

import { require_auth } from "../middleware/require_auth";
router.post("/create", require_auth, create_order);
router.get("/list", require_auth, list_order);
router.post("/checkout", require_auth, create_checkout);

export default router;
