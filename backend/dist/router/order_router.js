"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const order_controller_1 = require("../controller/order_controller");
const require_auth_1 = require("../middleware/require_auth");
router.post("/order/create", require_auth_1.require_auth, order_controller_1.create_order);
router.get("/order/list", require_auth_1.require_auth, order_controller_1.list_order);
router.post("/order/checkout", require_auth_1.require_auth, order_controller_1.create_checkout);
//consider PATCH
router.put("/order/cancel/:order_id", require_auth_1.require_auth, order_controller_1.cancel_order_customer);
router.put("/order/system-cancel/:order_id", require_auth_1.require_auth, order_controller_1.cancel_order_system);
exports.default = router;
