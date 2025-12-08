import express from "express";
const router = express.Router();

import { add_contact, get_single_contact, list_contact } from "../controller/contact_controller";

router.post("/add/contact", add_contact);
router.get("/list/contact", list_contact);
router.get("/list/single/contact/:id", get_single_contact);

export default router;
