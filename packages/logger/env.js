"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "prod"]).default("development"),
    LOGGER_LEVEL: zod_1.z.enum(["error", "debug", "info"]).optional(),
});
function createEnv(env) {
    const safeParseResult = envSchema.safeParse(env);
    if (!safeParseResult.success)
        throw new Error(safeParseResult.error.message);
    return safeParseResult.data;
}
exports.env = createEnv(process.env);
