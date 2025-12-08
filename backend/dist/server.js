"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const error_handler_1 = require("./middleware/error_handler");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_1 = __importDefault(require("passport"));
require("./auth/passport");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: true,
    methods: "GET, POST, PUT, DELETE",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});
const webhook_1 = __importDefault(require("./router/webhook"));
app.use("/api/stripe", webhook_1.default);
//later put Stripe here
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(passport_1.default.initialize());
//import here
const contact_router_1 = __importDefault(require("./router/contact_router"));
const product_router_1 = __importDefault(require("./router/product_router"));
const auth_router_1 = __importDefault(require("./router/auth_router"));
const comment_router_1 = __importDefault(require("./router/comment_router"));
const like_router_1 = __importDefault(require("./router/like_router"));
const cart_router_1 = __importDefault(require("./router/cart_router"));
const order_router_1 = __importDefault(require("./router/order_router"));
//app use here
app.use("/api", contact_router_1.default);
app.use("/api", product_router_1.default);
app.use("/api", auth_router_1.default);
app.use("/api", comment_router_1.default);
app.use("/api", like_router_1.default);
app.use("/api", cart_router_1.default);
app.use("/api", order_router_1.default);
app.use(error_handler_1.errorHandler);
async function connect_db() {
    try {
        const db_url = process.env.db_url;
        if (!db_url) {
            throw new Error("Missing DB URL for some reason");
        }
        await mongoose_1.default.connect(db_url);
        console.log("connected to db");
    }
    catch (err) {
        console.log("Error: ", err);
    }
}
app.listen(process.env.PORT_NO, function (err) {
    if (err) {
        console.error("cannot connect to port");
    }
    else {
        console.log(`connected to port ${process.env.PORT_NO}`);
    }
});
connect_db();
