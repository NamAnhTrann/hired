import express from "express";
import { add_cart, delete_per_item_cart, list_cart } from "../controller/cart_controller";
import { require_auth } from "../middleware/require_auth";

const router = express.Router();

router.post("/cart/add", require_auth, add_cart);
router.get("/list/cart", require_auth, list_cart);
router.delete("/delete/cart/item/:product_id", require_auth, delete_per_item_cart);

export default router;
