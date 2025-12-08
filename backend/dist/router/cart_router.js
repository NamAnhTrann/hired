"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cart_controller_1 = require("../controller/cart_controller");
const require_auth_1 = require("../middleware/require_auth");
const router = express_1.default.Router();
router.post("/cart/add", require_auth_1.require_auth, cart_controller_1.add_cart);
router.get("/list/cart", require_auth_1.require_auth, cart_controller_1.list_cart);
router.delete("/delete/cart/item/:product_id", require_auth_1.require_auth, cart_controller_1.delete_per_item_cart);
exports.default = router;
