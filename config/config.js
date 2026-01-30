export default {
  TOKEN_RESET_TTL: 15 * 60 * 1000, // 15 minuti

  RATE_LIMIT: {
    MAX_LOGIN_ATTEMPTS: 5,
    MAX_LOGIN_ATTEMPTS_WINDOW_MS: 15 * 60 * 1000, // 15 minuti
  },

  PAGINATION: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  },

  AVATAR: {
    PUBLIC_PATH: "/uploads/avatars/",
    FILE_SYSTEM_PATH:
      process.env.NODE_ENV === "test"
        ? "test/fixtures/files/uploads/avatars/"
        : "uploads/avatars/"
  },

  POST_STATUS: { 
    DRAFT: "draft", 
    PUBLISHED: "published" 
  }
};
