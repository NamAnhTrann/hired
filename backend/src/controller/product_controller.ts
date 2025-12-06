import Product from "../model/product_model";
import { Request, Response, NextFunction } from "express";
import { bad_request, internal, not_found } from "../middleware/error_handler";

export const add_product = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    //use req.user from auth
    //this is the same as req.user in JavaScript but with type safety
    const user = (req as any).user;

    if (!user) {
      return next(bad_request("User not authenticate to do this operation"));
    }

    //TODO: Later add in req.user for only authenticated user
    const newProduct = new Product({
      product_title: req.body.product_title,
      product_description: req.body.product_description,
      product_price: req.body.product_price,
      product_quantity: req.body.product_quantity,
      product_image: req.body.product_image,
      product_cateogry: req.body.product_cateogry,
      product_user: user._id,
    });
    await newProduct.save();
    return res
      .status(200)
      .json({ success: true, data: newProduct, message: "Product Added" });
  } catch (err: any) {
    //return error from Schema
    if (err.name === "ValidationError") {
      return next(bad_request(err.message));
    }
    //return intertal 500
    return next(internal(err.message));
  }
};

export const list_all_product = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let products = await Product.find({}).populate(
      "product_user",
      "user_username user_email"
    );
    return res
      .status(200)
      .json({ success: true, data: products, message: "List All Products" });
  } catch (err: any) {
    if (err.name === "ValidationError") {
      return next(bad_request(err.message));
    }

    return next(internal(err.message));
  }
};

export const list_single_product = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let product_id = req.params.id;
    if (!product_id) {
      return next(not_found(`Cannot find product_id: ${product_id}`));
    }

    let product = await Product.findById(product_id);

    return res
      .status(200)
      .json({ success: true, data: product, message: "List Single Product" });
  } catch (err: any) {
    if (err.name === "ValidationError") {
      return next(bad_request(err.message));
    }

    return next(internal(err.message));
  }
};
