require("dotenv").config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { errorHandler } from "./middleware/error_handler";

const app = express();
//later put Stripe here

app.use(express.json());
app.use(errorHandler);

app.use(
  cors({
    origin: ["http://localhost:4200", ""],
    methods: "GET, POST, PUT, DELETE",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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
