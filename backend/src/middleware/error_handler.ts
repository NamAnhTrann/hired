//Purpose of this class is to create re-usable error handling methods
import express, { Request, Response } from "express";

// this custom ApiError class will inherits the JavaScript built in Error class.
export class ApiError extends Error{
    status:number;

    constructor(status:number, message:string){
        super(message);
        //custom property, since the built in error class does not have HTTP status.
        this.status = status;
    }
}
//These are common http errors
export const bad_request = (msg: string) => new ApiError(400,msg);
export const unauthorized = (msg: string) => new ApiError(401,msg);
export const forbidden = (msg: string) => new ApiError(403,msg);
export const not_found = (msg: string) => new ApiError(404,msg);
export const conflict = (msg: string) => new ApiError(409,msg);
export const internal = (msg: string) => new ApiError(500,msg);

export function errorHandler(err:any, req:Request, res:Response){
    console.error("ERROR: ", err); //print to console for debugging
    //fallback status
    const status = err.status || 500;
    res.status(status).json({
        success:false,
        message: err.message || "Something went wrong?!"
    })
}