"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internal = exports.conflict = exports.not_found = exports.forbidden = exports.unauthorized = exports.bad_request = exports.ApiError = void 0;
exports.errorHandler = errorHandler;
// this custom ApiError class will inherits the JavaScript built in Error class.
class ApiError extends Error {
    constructor(status, message) {
        super(message);
        //custom property, since the built in error class does not have HTTP status.
        this.status = status;
    }
}
exports.ApiError = ApiError;
//These are common http errors
const bad_request = (msg) => new ApiError(400, msg);
exports.bad_request = bad_request;
const unauthorized = (msg) => new ApiError(401, msg);
exports.unauthorized = unauthorized;
const forbidden = (msg) => new ApiError(403, msg);
exports.forbidden = forbidden;
const not_found = (msg) => new ApiError(404, msg);
exports.not_found = not_found;
const conflict = (msg) => new ApiError(409, msg);
exports.conflict = conflict;
const internal = (msg) => new ApiError(500, msg);
exports.internal = internal;
function errorHandler(err, req, res, next) {
    console.error("ERROR: ", err); //print to console for debugging
    //fallback status
    const status = err.status || 500;
    return res.status(status).json({
        success: false,
        message: err.message || "Something went wrong?!",
    });
}
