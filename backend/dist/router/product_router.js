"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const product_controller_1 = require("../controller/product_controller");
const require_auth_1 = require("../middleware/require_auth");
router.post("/add/product", require_auth_1.require_auth, product_controller_1.add_product);
router.get("/list/all/product", product_controller_1.list_all_product);
router.get("/list/single/product/:id", product_controller_1.list_single_product);
exports.default = router;
