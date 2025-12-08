"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const comment_controller_1 = require("../controller/comment_controller");
const require_auth_1 = require("../middleware/require_auth");
const router = express_1.default.Router();
router.post("/comment/add", require_auth_1.require_auth, comment_controller_1.add_comment);
router.post("/comment/reply", require_auth_1.require_auth, comment_controller_1.reply_comment);
router.get("/comment/:product_id", comment_controller_1.list_comment);
router.delete("/comment/delete/:id", require_auth_1.require_auth, comment_controller_1.delete_comment);
exports.default = router;
