"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const passport_1 = __importDefault(require("passport"));
const user_model_1 = __importDefault(require("../model/user_model"));
const error_handler_1 = require("../middleware/error_handler");
//NOTE: The JWT Cookie name is "token"
//register controller
const register = async function (req, res, next) {
    try {
        //extract the data from req.body
        const { user_username, user_email, user_first_name, user_last_name, user_password, user_phone_number, } = req.body;
        //validations
        if (!user_email || !user_password) {
            return next((0, error_handler_1.bad_request)("Email and password are required"));
        }
        //check existing user, if email already exist, cannot have doublicate
        const existing_user = await user_model_1.default.findOne({ user_email });
        if (existing_user) {
            return next((0, error_handler_1.conflict)("Email already exist"));
        }
        //hash the password
        const hashed_password = await bcrypt_1.default.hash(user_password, 10);
        //create new user object
        const new_user = new user_model_1.default({
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
    }
    catch (err) {
        if (err.name === "ValidationError") {
            return next((0, error_handler_1.bad_request)(err.message));
        }
        return next((0, error_handler_1.internal)("Failed to register user"));
    }
};
exports.register = register;
const login = async function (req, res, next) {
    // Use passport local strategy for authentication
    passport_1.default.authenticate("local", { session: false }, async function (err, user, info) {
        // If some unknown error happened
        if (err) {
            return next((0, error_handler_1.internal)("Authentication error"));
        }
        // If user is not found or password is wrong
        if (!user) {
            return next((0, error_handler_1.bad_request)("Invalid email or password"));
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
            const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET_KEY, {
                expiresIn: "7d",
            });
            // Store JWT in an httpOnly cookie
            res.cookie("token", token, {
                httpOnly: true,
                // sameSite: "lax",
                secure: false,
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
        }
        catch (err) {
            return next((0, error_handler_1.internal)("Failed to generate login token"));
        }
    })(req, res, next);
};
exports.login = login;
//logout so clear cookies
const logout = async function (req, res) {
    res.clearCookie("token");
    return res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
};
exports.logout = logout;
