import "dotenv/config";

export default {
  provider: "gmail",
  gmail: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
};
