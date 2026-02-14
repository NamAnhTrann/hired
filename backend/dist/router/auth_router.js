"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controller/auth_controller");
const require_auth_1 = require("../middleware/require_auth");
const router = express_1.default.Router();
router.post("/register/user", auth_controller_1.register);
router.post("/login/user", auth_controller_1.login);
router.post("/logout", auth_controller_1.logout);
router.get("/me", require_auth_1.require_auth, async (req, res) => {
    const user = req.user;
    return res.status(200).json({
        success: true,
        user: {
            id: user._id,
            user_email: user.user_email,
            user_first_name: user.user_first_name,
            user_last_name: user.user_last_name,
            user_username: user.user_username,
            user_phone_number: user.user_phone_number,
            user_shipping_address: user.user_shipping_address || {
                street: "",
                city: "",
                state: "",
                postcode: "",
                country: ""
            }
        }
    });
});
exports.default = router;
