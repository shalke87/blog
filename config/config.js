export default {
  TOKEN_RESET_TTL: 15 * 60 * 1000, // 15 minuti
  RATE_LIMIT: {
    MAX_LOGIN_ATTEMPTS: 5,
    MAX_LOGIN_ATTEMPTS_WINDOW_MS: 15 * 60 * 1000, // 15 minuti
  },
  PAGINATION: {
    defaultLimit: 20,
    maxLimit: 100
  }
};
