import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import User from "../model/user_model";
import { Request, Response, NextFunction } from "express";

//helper function: tells passport jwt how to read the token from the incomming request.
// Choose to read it frmo an HTTP-ONLY cookie called "token"
function cookieExtractor(req: Request): string | null {
  //if the request or cookies object does not exist, return null
  if (!req || !req.cookies) {
    return null;
  }
  // if it dose, return token from cookies, otherwise return null
  return req.cookies.token || null;
}

//Now, we register the JWT strategy inside passport
passport.use(
  new JwtStrategy(
    {
      //this will tell Passport where to read the JWT token from
      //which is the helper function that extract the cookies that reuturn the token
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),

      //key use to verify the token signature
      secretOrKey: process.env.JWT_SECRET_KEY!,
    },
    //verification function
    async function (payload: any, done) {
      try {
        //look up the user by id stored inside the jwt payload
        const user = await User.findById(payload.id);

        //if no user found, auth fails
        if (!user) {
          return done(null, false);
        }
        //if user exist, attach it to the request under req.user
        return done(null, user);
      } catch (err: any) {
        //any database or unexpected error goes here
        return done(err, false);
      }
    }
  )
);

export default passport;
