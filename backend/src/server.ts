require("dotenv").config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { errorHandler } from "./middleware/error_handler";
import cookieParser from "cookie-parser";
import passport from "passport";
import "./auth/passport";

const app = express();
//later put Stripe here

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(errorHandler);

app.use(
  cors({
    origin: ["http://localhost:4200", ""],
    methods: "GET, POST, PUT, DELETE",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
//import here
import contact_router from "./router/contact_router";
import product_router from "./router/product_router";
import auth_router from "./router/auth_router";
import comment_router from "./router/comment_router";
import like_router from "./router/like_router";
import cart_router from "./router/cart_router";
//app use here
app.use("/api", contact_router);
app.use("/api", product_router);
app.use("/api", auth_router);
app.use("/api", comment_router);
app.use("/api", like_router);
app.use("/api", cart_router);


async function connect_db() {
  try {
    const db_url = process.env.db_url;
    if (!db_url) {
      throw new Error("Missing DB URL for some reason");
    }
    await mongoose.connect(db_url);
    console.log("connected to db");
  } catch (err: any) {
    console.log("Error: ", err);
  }
}

app.listen(function (err) {
  if (err) {
    console.error("cannot connect to port");
  } else {
    console.log(`connected to port ${process.env.PORT_NO}`);
  }
});

connect_db();
