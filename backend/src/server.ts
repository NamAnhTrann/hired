require("dotenv").config();
import bodyParser from "body-parser";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { errorHandler } from "./middleware/error_handler";
import cookieParser from "cookie-parser";
import passport from "passport";
import "./auth/passport";

const app = express();

app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());
import webhook_router from "./router/webhook";
app.use(
  "/api/stripe",
  bodyParser.raw({ type: "application/json" }),
  webhook_router
);
app.use(express.json());

app.use(passport.initialize());

import contact_router from "./router/contact_router";
import product_router from "./router/product_router";
import auth_router from "./router/auth_router";
import comment_router from "./router/comment_router";
import like_router from "./router/like_router";
import cart_router from "./router/cart_router";
import order_router from "./router/order_router";
import trending_router from "./router/trending_router";
import seller_router from "./router/seller_route";
import stripe_router from "./router/stripe_router";
app.use("/api", contact_router);
app.use("/api", product_router);
app.use("/api", auth_router);
app.use("/api", comment_router);
app.use("/api", like_router);
app.use("/api", cart_router);
app.use("/api", order_router);
app.use("/api", trending_router);
app.use("/api", seller_router);
app.use("/api", stripe_router);

app.use(errorHandler);

async function connect_db() {
  try {
    const db_url = process.env.db_url;
    if (!db_url) throw new Error("Missing DB URL");

    await mongoose.connect(db_url);
    console.log("connected to db");
  } catch (err: any) {
    console.log("Error: ", err);
  }
}

app.listen(process.env.PORT_NO, function (err) {
  if (err) {
    console.error("cannot connect to port");
  } else {
    console.log(`connected to port ${process.env.PORT_NO}`);
  }
});

connect_db();
