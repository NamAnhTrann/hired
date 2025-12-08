"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_model_1 = __importDefault(require("../model/user_model"));
//this is the basic password and email login strategy
passport_1.default.use(new passport_local_1.Strategy({
    //form field for email
    usernameField: "user_email",
    //field for password
    passwordField: "user_password",
}, async function (user_email, user_password, done) {
    try {
        //find the user by email
        const user = await user_model_1.default.findOne({ user_email: user_email });
        //if user not found, fails login
        if (!user) {
            return done(null, false, { message: "Incorrect email" });
        }
        //compare password with hashed in db
        const passwordmatch = await bcrypt_1.default.compare(user_password, user.user_password);
        if (!passwordmatch) {
            return done(null, false, { message: "Incorrect Password" });
        }
        //success, return user object
        return done(null, user);
    }
    catch (err) {
        return done(err);
    }
}));
exports.default = passport_1.default;
