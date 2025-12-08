"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const contact_controller_1 = require("../controller/contact_controller");
router.post("/add/contact", contact_controller_1.add_contact);
router.get("/list/contact", contact_controller_1.list_contact);
router.get("/list/single/contact/:id", contact_controller_1.get_single_contact);
exports.default = router;
