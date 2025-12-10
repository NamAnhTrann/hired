import express from "express";
import { logout,register,login } from "../controller/auth_controller";
import { require_auth } from "../middleware/require_auth";
const router = express.Router();

router.post("/register/user", register);
router.post("/login/user", login)
router.post("/logout", logout);

router.get("/me", require_auth, async (req: any, res) => {
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



export default router;
