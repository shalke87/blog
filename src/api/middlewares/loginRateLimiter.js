import rateLimit from "express-rate-limit";
import config from "../../../config/config.js";

export const loginRateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT.MAX_LOGIN_ATTEMPTS_WINDOW_MS, // 15 minuti
  max: config.RATE_LIMIT.MAX_LOGIN_ATTEMPTS,                   // massimo 5 tentativi
  message: {
    message: "Too many login attempts. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false
});
