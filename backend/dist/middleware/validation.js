"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate_search = validate_search;
function validate_search(req, res, next) {
    let queries = String(req.query.q || "");
    queries = queries.trim().slice(0, 100).replace(/[^\w\s-]/gi, "");
    req.query.queries = queries;
    next();
}
