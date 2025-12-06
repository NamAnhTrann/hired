import express from "express";
import { logout,register,login } from "../controller/auth_controller";
const router = express.Router();

router.post("/register/user", register);
router.post("/login/user", login)
router.post("/logout", logout);

export default router;
