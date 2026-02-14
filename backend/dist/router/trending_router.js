"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const trending_controller_1 = require("../controller/trending_controller");
const require_auth_1 = require("../middleware/require_auth");
router.get("/list/trending", trending_controller_1.list_trending);
router.post("/add/trending", require_auth_1.require_auth, trending_controller_1.add_trending_item);
exports.default = router;
