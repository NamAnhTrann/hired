import Seller from "../model/seller_model";
import { Request, Response, NextFunction } from "express";
import {
  bad_request,
  conflict,
  internal,
  not_found,
  unauthorized,
} from "../middleware/error_handler";

export const create_seller_profile = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user_id = (req as any).user._id;
    if (!user_id) {
      return next(unauthorized("unauthorised"));
    }

    const { store_name, store_description, store_address } = req.body;

    if (!store_name) {
      return next(bad_request("Store name is required"));
    }

    if (!store_description) {
      return next(bad_request("Store description is required"));
    }

    const require_address = ["street", "city", "state", "postcode", "country"];
    for (const field of require_address) {
      if (!store_address?.[field]) {
        return next(bad_request(`Store address.${field} is required`));
      }
    }

    const existing_seller_profile = await Seller.findOne({ user_id });
    if (existing_seller_profile) {
      return next(conflict("This profile already exist"));
    }

    //create if dont exist
    const seller = new Seller({
      user_id,
      store_name,
      store_description: store_description || "",
      store_address,
      seller_status: "pending",
    });

    await seller.save();

    return res.status(201).json({
      success: true,
      message: "Seller profile created",
      data: seller,
    });
  } catch (err: any) {
    //return error from Schema
    if (err.name === "ValidationError") {
      return next(bad_request(err.message));
    }
    //return intertal 500
    return next(internal(err.message));
  }
};

export const get_seller_profile = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user_id = (req as any).user._id;
    if (!user_id) {
      return next(unauthorized("Unauthorised"));
    }
    const seller = await Seller.findOne({ user_id });
    if (!seller) {
      return next(not_found("seller profile not found"));
    }

    return res
      .status(200)
      .json({ message: "Seller found", success: true, data: seller });
  } catch (err: any) {
    //return error from Schema
    if (err.name === "ValidationError") {
      return next(bad_request(err.message));
    }
    //return intertal 500
    return next(internal(err.message));
  }
};

export const get_status = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user_id = (req as any).user._id;
    if(!user_id){ 
        return next(unauthorized("Unauthorised"));
    }

    const seller = await Seller.findOne({ user_id }).select(
      "_id seller_status stripe_onboarded store_name"
    );
    return res.status(200).json({
      success: true,
      is_seller: !!seller,
      seller: seller || null,
    });
  } catch (err: any) {
    //return error from Schema
    if (err.name === "ValidationError") {
      return next(bad_request(err.message));
    }
    //return intertal 500
    return next(internal(err.message));
  }
};

