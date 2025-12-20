
import express from "express";
const router = express.Router();

import { add_trending_item, list_trending } from "../controller/trending_controller";
import { require_auth } from "../middleware/require_auth";

router.get("/list/trending", list_trending);
router.post("/add/trending", require_auth, add_trending_item);


export default router;
