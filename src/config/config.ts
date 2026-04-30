import path from "path";

export default {

  PAGINATION: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  },

  COMMENT: {
    MAX_LENGTH: 300
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
  },

  ENV: {
    PORT: process.env.PORT || 3000,
    SERVER_URL: process.env.SERVER_URL || "http://localhost:3000",
    NODE_ENV: process.env.NODE_ENV || "development",
    MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/blog",
    CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
    EMAIL_USERNAME: process.env.EMAIL_USERNAME,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD
  }



};
