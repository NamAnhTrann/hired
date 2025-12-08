import express from "express";
import { logout,register,login } from "../controller/auth_controller";
import { require_auth } from "../middleware/require_auth";
const router = express.Router();

router.post("/register/user", register);
router.post("/login/user", login)
router.post("/logout", logout);

router.get("/me", require_auth, (req: any, res) => {
  return res.status(200).json({
    success: true,
    user: req.user
  });
});

export default router;
