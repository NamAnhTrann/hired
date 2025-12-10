import express from "express";
const router = express.Router();

import { add_product, list_all_product, list_single_product } from "../controller/product_controller";
import { optional_auth, require_auth } from "../middleware/require_auth";

router.post("/add/product", require_auth, add_product);
router.get("/list/all/product", optional_auth, list_all_product);
router.get("/list/single/product/:id", optional_auth,list_single_product);

export default router;
