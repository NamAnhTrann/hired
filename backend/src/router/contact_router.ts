import express from "express";
const router = express.Router();

import { add_contact } from "../controller/contact_controller";

router.post("/add/contact", add_contact);

export default router;
