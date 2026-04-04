import rateLimit from "express-rate-limit";
import authConfig from "../../../config/authConfig.js";

export const verifyEmailRateLimiter = rateLimit({
  windowMs: authConfig.RATE_LIMIT.MAX_EMAIL_VERIFICATION_ATTEMPTS_WINDOW_MS, // 15 minuti
  max: authConfig.RATE_LIMIT.MAX_EMAIL_VERIFICATION_ATTEMPTS,                   // massimo 20 tentativi
  message: {
    message: "Too many email verification attempts. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false
});
