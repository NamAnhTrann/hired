"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// router/like_router.ts
const express_1 = __importDefault(require("express"));
const require_auth_1 = require("../middleware/require_auth");
const like_controller_1 = require("../controller/like_controller");
const router = express_1.default.Router();
router.post("/like/product", require_auth_1.require_auth, like_controller_1.like_product);
router.post("/like/comment", require_auth_1.require_auth, like_controller_1.like_comment);
router.post("/like/remove", require_auth_1.require_auth, like_controller_1.unlike);
exports.default = router;
