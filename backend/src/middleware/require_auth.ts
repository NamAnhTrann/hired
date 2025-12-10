import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { unauthorized, internal } from "./error_handler";

export function require_auth(req: Request, res: Response, next: NextFunction) {
  passport.authenticate(
    "jwt",
    { session: false },
    function (err: any, user: any) {
      if (err) {
        return next(internal("Authentication error"));
      }
      if (!user) {
        return next(unauthorized("Unauthorised: Invalid or missing token"));
      }

      //this is req.user
      (req as any).user = user;
        //Continue to controller
      return next();
    }
  )(req, res, next);
}

//for product listing without auths
export function optional_auth(req: Request, res: Response, next: NextFunction) {
  passport.authenticate(
    "jwt",
    { session: false },
    function (err:any, user:any) {
      // ignore all errors
      // do NOT throw 401
      req.user = user || null;
      next();
    }
  )(req, res, next);
}

