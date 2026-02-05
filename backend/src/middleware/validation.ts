import { Request, Response, NextFunction } from "express";


export function validate_search(req:Request,res:Response, next:NextFunction){
    let queries = String(req.query.q || "");

    queries = queries.trim().slice(0,100).replace(/[^\w\s-]/gi, "");

    req.query.queries = queries;
    next();
}   