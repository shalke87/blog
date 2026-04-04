import rateLimit from "express-rate-limit";
import authConfig from "../../../config/authConfig.js";

export const loginRateLimiter = rateLimit({
  windowMs: authConfig.RATE_LIMIT.MAX_LOGIN_ATTEMPTS_WINDOW_MS, // 15 minuti
  max: authConfig.RATE_LIMIT.MAX_LOGIN_ATTEMPTS,                   // massimo 5 tentativi
  message: {
    message: "Too many login attempts. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false
});
