"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const env_1 = require("./env");
const level = env_1.env.LOGGER_LEVEL ?? (env_1.env.NODE_ENV === "development" ? "debug" : "error");
const isDevelopment = env_1.env.NODE_ENV === "development";
const format = isDevelopment
    ? winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaString = Object.keys(meta).length
            ? `\n${JSON.stringify(meta, null, 2)}`
            : "";
        return `${timestamp} [${level}]: ${message}${metaString}`;
    }))
    : winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json());
exports.logger = winston_1.default.createLogger({
    level: level,
    format: format,
    transports: [new winston_1.default.transports.Console()],
});
