import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import RegisterValidator from "../validators/RegisterValidator.js";
import LoginValidator from "../validators/LoginValidator.js";
import ResetPasswordRequestValidator from "../validators/ResetPasswordRequestValidator.js";
import resetTokenValidator from "../validators/ResetTokenValidator.js";

const router = Router();

router.post("/register", RegisterValidator, AuthController.register);
router.post("/login", LoginValidator, AuthController.login);
router.get("/resetPassword/confirm", resetTokenValidator, AuthController.resetPasswordConfirm);
router.post("/resetPassword", ResetPasswordRequestValidator, AuthController.resetPasswordRequest);




export default router;
