import express, { NextFunction } from "express";
import Contact from "../model/contact_model";
import { Request, Response } from "express";
import { bad_request, internal } from "../middleware/error_handler";

//TODO: Add validations (use ZOD)
export const add_contact = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let newContact = new Contact({
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
  } catch (err: any) {
    //this will handle errors from Schemas
    if(err.name === "ValidationError"){
        return next(bad_request(err.message));
    }
    //call the error handler
    return next(internal("Failed to add contact"));
  }
};
