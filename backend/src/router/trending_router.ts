
import express from "express";
const router = express.Router();

import { add_trending_item, list_trending } from "../controller/trending_controller";

router.get("/list/trending", list_trending);
router.post("/add/trending", add_trending_item);


export default router;
