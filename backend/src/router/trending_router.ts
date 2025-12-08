
import express from "express";
const router = express.Router();

import { list_trending } from "../controller/trending_controller";

router.get("/list/trending", list_trending);

export default router;
