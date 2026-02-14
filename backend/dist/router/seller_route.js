"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const seller_controller_1 = require("../controller/seller_controller");
const require_auth_1 = require("../middleware/require_auth");
router.post("/create/seller/profile", require_auth_1.require_auth, seller_controller_1.create_seller_profile);
router.get("/get/seller/profile", require_auth_1.require_auth, seller_controller_1.get_seller_profile);
router.get('/get/seller/status', require_auth_1.require_auth, seller_controller_1.get_status);
router.get('/get/seller/stats', require_auth_1.require_auth, seller_controller_1.get_stats);
router.get("/get/seller/from_product/:product_id", seller_controller_1.get_seller_from_product);
router.get("/by-seller/:userId", seller_controller_1.list_products_by_seller);
exports.default = router;
