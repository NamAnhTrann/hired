import express from "express";
import { add_comment, list_comment, delete_comment, reply_comment } from "../controller/comment_controller";
import { require_auth } from "../middleware/require_auth";

const router = express.Router();

router.post("/comment/add", require_auth, add_comment);
router.post("/comment/reply", require_auth, reply_comment);
router.get("/comment/:product_id", list_comment);
router.delete("/comment/delete/:id", require_auth, delete_comment);

export default router;
