import { Request, Response, NextFunction } from "express";
import {
  bad_request,
  internal,
  not_found,
  unauthorized,
} from "../middleware/error_handler";

import Trending from "../model/trending_model";

export const list_trending = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const trending = await Trending.find({}).populate("product");
    return res.json({
      success: true,
      data: trending,
      message: "trending listed",
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
