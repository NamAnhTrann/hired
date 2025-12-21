import express from "express";
const router = express.Router();

import { add_product, list_all_product, list_single_product, delete_product, edit_product_details } from "../controller/product_controller";
import { optional_auth, require_auth } from "../middleware/require_auth";

router.post("/add/product", require_auth, add_product);
router.get("/list/all/product", optional_auth, list_all_product);
router.get("/list/single/product/:id", optional_auth,list_single_product);
router.delete("/delete/product/:id", require_auth, delete_product);
router.put("/edit/product/:id", require_auth, edit_product_details);

export default router;
