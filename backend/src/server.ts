require("dotenv").config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { errorHandler } from "./middleware/error_handler";
import cookieParser from "cookie-parser";
import passport from "passport";
import "./auth/passport";

const app = express();

// ------------------------------
// CORS FIRST
// ------------------------------
app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ------------------------------
// COOKIE PARSER SECOND
// ------------------------------
app.use(cookieParser());

// ------------------------------
// JSON PARSER THIRD
// ------------------------------
app.use(express.json());

// ------------------------------
// PASSPORT INITIALIZATION
// ------------------------------
app.use(passport.initialize());

// ------------------------------
// STRIPE WEBHOOK
// If you need raw body, PUT it above express.json
// Otherwise leave it here
// ------------------------------
import webhook_router from "./router/webhook";
app.use("/api/stripe", webhook_router);

// ------------------------------
// ROUTERS
// ------------------------------
import contact_router from "./router/contact_router";
import product_router from "./router/product_router";
import auth_router from "./router/auth_router";
import comment_router from "./router/comment_router";
import like_router from "./router/like_router";
import cart_router from "./router/cart_router";
import order_router from "./router/order_router";
import trending_router from "./router/trending_router";

app.use("/api", contact_router);
app.use("/api", product_router);
app.use("/api", auth_router);
app.use("/api", comment_router);
app.use("/api", like_router);
app.use("/api", cart_router);
app.use("/api", order_router);
app.use("/api", trending_router);

// ------------------------------
// GLOBAL ERROR HANDLER
// ------------------------------
app.use(errorHandler);

// ------------------------------
// DB CONNECTION
// ------------------------------
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

// ------------------------------
// START SERVER
// ------------------------------
app.listen(process.env.PORT_NO, function (err) {
  if (err) {
    console.error("cannot connect to port");
  } else {
    console.log(`connected to port ${process.env.PORT_NO}`);
  }
});

connect_db();
