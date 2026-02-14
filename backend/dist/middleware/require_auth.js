"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.require_auth = require_auth;
exports.optional_auth = optional_auth;
const passport_1 = __importDefault(require("passport"));
const error_handler_1 = require("./error_handler");
function require_auth(req, res, next) {
    passport_1.default.authenticate("jwt", { session: false }, function (err, user) {
        if (err) {
            return next((0, error_handler_1.internal)("Authentication error"));
        }
        if (!user) {
            return next((0, error_handler_1.unauthorized)("Unauthorised: Invalid or missing token"));
        }
        //this is req.user
        req.user = user;
        //Continue to controller
        return next();
    })(req, res, next);
}
//for product listing without auths
function optional_auth(req, res, next) {
    passport_1.default.authenticate("jwt", { session: false }, function (err, user) {
        // ignore all errors
        // do NOT throw 401 
        req.user = user || null;
        next();
    })(req, res, next);
}
