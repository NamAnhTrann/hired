// router/like_router.ts
import express from "express";
import { require_auth } from "../middleware/require_auth";
import { like_product, like_comment, unlike } from "../controller/like_controller";

const router = express.Router();

router.post("/like/product", require_auth, like_product);
router.post("/like/comment", require_auth, like_comment);
router.delete("/like/remove", require_auth, unlike);

export default router;
