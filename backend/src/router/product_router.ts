import express from "express";
const router = express.Router();

import { add_product, list_all_product, list_single_product } from "../controller/product_controller";

router.post("/add/product", add_product);
router.get("list/all/product", list_all_product);
router.get("/list/single/product/:id", list_single_product);

export default router;
