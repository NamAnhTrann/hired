import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import User from "../model/user_model";

//this is the basic password and email login strategy
passport.use(
  new LocalStrategy(
    {
      //form field for email
      usernameField: "user_email",
      //field for password
      passwordField: "user_password",
    },
    async function (user_email: string, user_password: string, done) {
      try {
        //find the user by email
        const user = await User.findOne({ user_email: user_email });

        //if user not found, fails login
        if (!user) {
          return done(null, false, { message: "Incorrect email" });
        }
        //compare password with hashed in db
        const passwordmatch = await bcrypt.compare(
          user_password,
          user.user_password
        );

        if (!passwordmatch) {
          return done(null, false, { message: "Incorrect Password" });
        }
        //success, return user object
        return done(null, user);
      } catch (err: any) {
        return done(err);
      }
    }
  )
);
export default passport;
