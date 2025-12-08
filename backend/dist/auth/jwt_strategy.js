"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_jwt_1 = require("passport-jwt");
const user_model_1 = __importDefault(require("../model/user_model"));
//helper function: tells passport jwt how to read the token from the incomming request.
// Choose to read it frmo an HTTP-ONLY cookie called "token"
function cookieExtractor(req) {
    //if the request or cookies object does not exist, return null
    if (!req || !req.cookies) {
        return null;
    }
    // if it dose, return token from cookies, otherwise return null
    return req.cookies.token || null;
}
//Now, we register the JWT strategy inside passport
passport_1.default.use(new passport_jwt_1.Strategy({
    //this will tell Passport where to read the JWT token from
    //which is the helper function that extract the cookies that reuturn the token
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromExtractors([cookieExtractor]),
    //key use to verify the token signature
    secretOrKey: process.env.JWT_SECRET_KEY,
}, 
//verification function
async function (payload, done) {
    try {
        //look up the user by id stored inside the jwt payload
        const user = await user_model_1.default.findById(payload.id);
        //if no user found, auth fails
        if (!user) {
            return done(null, false);
        }
        //if user exist, attach it to the request under req.user
        return done(null, user);
    }
    catch (err) {
        //any database or unexpected error goes here
        return done(err, false);
    }
}));
exports.default = passport_1.default;
