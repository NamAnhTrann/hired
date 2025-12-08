"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_single_contact = exports.list_contact = exports.add_contact = void 0;
const contact_model_1 = __importDefault(require("../model/contact_model"));
const error_handler_1 = require("../middleware/error_handler");
//TODO: Add validations (use ZOD)
const add_contact = async function (req, res, next) {
    try {
        let newContact = new contact_model_1.default({
            contact_last_name: req.body.contact_last_name,
            contact_first_name: req.body.contact_first_name,
            contact_email: req.body.contact_email,
            contact_phone_number: req.body.contact_phone_number,
            contact_type: req.body.contact_type,
            contact_message: req.body.contact_message,
            contact_support_file: req.body.contact_support_file,
        });
        await newContact.save();
        return res
            .status(200)
            .json({ success: true, data: newContact, message: "Contact Added" });
    }
    catch (err) {
        //this will handle errors from Schemas
        if (err.name === "ValidationError") {
            return next((0, error_handler_1.bad_request)(err.message));
        }
        //call the error handler
        return next((0, error_handler_1.internal)(err.message));
    }
};
exports.add_contact = add_contact;
const list_contact = async function (req, res, next) {
    try {
        const contacts = await contact_model_1.default.find({});
        if (!contacts) {
            return next((0, error_handler_1.not_found)("Contacts list cannot be found"));
        }
        return res
            .status(200)
            .json({ success: true, data: contacts, message: "Listed all contacts" });
    }
    catch (err) {
        //this will handle errors from Schemas
        if (err.name === "ValidationError") {
            return next((0, error_handler_1.bad_request)(err.message));
        }
        //call the error handler
        return next((0, error_handler_1.internal)(err.message));
    }
};
exports.list_contact = list_contact;
const get_single_contact = async function (req, res, next) {
    try {
        const contact_id = req.params.id;
        let contact = await contact_model_1.default.findById(contact_id);
        if (!contact) {
            return next((0, error_handler_1.not_found)("Cannot list this contact"));
        }
        return res
            .status(200)
            .json({ success: true, data: contact, message: "contact listed" });
    }
    catch (err) {
        //this will handle errors from Schemas
        if (err.name === "ValidationError") {
            return next((0, error_handler_1.bad_request)(err.message));
        }
        //call the error handler
        return next((0, error_handler_1.internal)(err.message));
    }
};
exports.get_single_contact = get_single_contact;
