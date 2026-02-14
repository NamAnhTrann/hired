import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";

import User from "../model/user_model";
import { bad_request, conflict, internal } from "../middleware/error_handler";

//NOTE: The JWT Cookie name is "token"

//register controller
export const register = async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    //extract the data from req.body
    const {
      user_username,
      user_email,
      user_first_name,
      user_last_name,
      user_password,
      user_phone_number,
    } = req.body;

    //validations
    if (!user_email || !user_password) {
      return next(bad_request("Email and password are required"));
    }

    //check existing user, if email already exist, cannot have doublicate
    const existing_user = await User.findOne({ user_email });
    if (existing_user) {
      return next(conflict("Email already exist"));
    }

    //hash the password
    const hashed_password = await bcrypt.hash(user_password, 10);

    //create new user object
    const new_user = new User({
      user_first_name,
      user_last_name,
      user_username,
      user_email,
      user_phone_number,
      user_password: hashed_password,
    });

    //save user to db
    await new_user.save();

    //return success json object
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: new_user,
    });
    //error catching and handling
  } catch (err: any) {
    if (err.name === "ValidationError") {
      return next(bad_request(err.message));
    }

    return next(internal("Failed to register user"));
  }
};

export const login = async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Use passport local strategy for authentication
  passport.authenticate(
    "local",
    { session: false },
    async function (err: any, user: any, info: any) {
      // If some unknown error happened
      if (err) {
        return next(internal("Authentication error"));
      }

      // If user is not found or password is wrong
      if (!user) {
        return next(bad_request("Invalid email or password"));
      }

      try {
        // Create JWT payload
        const payload = {
          id: user._id,
          user_email: user.user_email,
          user_username: user.user_username,
          user_first_name: user.user_first_name,
          user_last_name: user.user_last_name,
          user_phone_number: user.user_phone_number,
        };

        // Sign the JWT using secret key
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY!, {
          expiresIn: "7d",
        });

        // Store JWT in an httpOnly cookie
        res.cookie("token", token, {
          httpOnly: true,
          secure: false, // HTTP only
          sameSite: "lax", // REQUIRED for cross-origin HTTP
          path: "/", // REQUIRED
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
          success: true,
          message: "Logged in successfully",
          user: {
            id: user._id,
            user_email: user.user_email,
            user_first_name: user.user_first_name,
            user_last_name: user.user_last_name,
            user_username: user.user_username,
            user_phone_number: user.user_phone_number,
          },
        });
      } catch (err: any) {
        return next(internal("Failed to generate login token"));
      }
    },
  )(req, res, next);
};

//logout so clear cookies
export const logout = async function (req: Request, res: Response) {
  res.clearCookie("token", {
  path: "/",
  sameSite: "lax",
  secure: false,
});

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
