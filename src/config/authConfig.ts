
export default {
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1h",

  // Bcrypt / Argon2 (se usi bcrypt)
 BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS ?? "12"),

  USER_STATUS: {
    ACTIVE: "active",
    PENDING: "pending",
    BANNED: "banned",
    SUSPENDED: "suspended"
  },

  RATE_LIMIT: {
    MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS ?? "10"),
    MAX_LOGIN_ATTEMPTS_WINDOW_MS: parseInt(process.env.MAX_LOGIN_ATTEMPTS_WINDOW_MS ?? "60000"), // 1 minuto
    MAX_EMAIL_VERIFICATION_ATTEMPTS: parseInt(process.env.MAX_EMAIL_VERIFICATION_ATTEMPTS ?? "20"),
    MAX_EMAIL_VERIFICATION_ATTEMPTS_WINDOW_MS: parseInt(process.env.MAX_EMAIL_VERIFICATION_ATTEMPTS_WINDOW_MS ?? "900000") // 15 minuti
  },



  PASSWORD_RESET_TOKEN_TTL: 15 * 60 * 1000, // 15 minuti

  EMAIL_VERIFICATION_TOKEN_TTL: 3600000 // 1 hour in milliseconds
};
