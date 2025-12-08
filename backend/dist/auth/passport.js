"use strict";
//This file loads and initializes all Passport strategies in one place.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
require("./local_strategy"); //local
require("./jwt_strategy"); //jwt
exports.default = passport_1.default;
