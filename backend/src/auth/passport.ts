//This file loads and initializes all Passport strategies in one place.

import passport from "passport";

import "./local_strategy"; //local
import "./jwt_strategy"; //jwt

export default passport;