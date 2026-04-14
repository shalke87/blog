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
  }

  
};
