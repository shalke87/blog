import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import RegisterValidator from "../validators/authValidators/RegisterValidator.js";
import LoginValidator from "../validators/authValidators/LoginValidator.js";
import ResetPasswordRequestValidator from "../validators/authValidators/ResetPasswordRequestValidator.js";
import ResetTokenValidator from "../validators/authValidators/ResetTokenValidator.js";
import ResetUpdatePasswordValidator from "../validators/authValidators/ResetUpdatePasswordValidator.js";
import { loginRateLimiter } from "../../middlewares/loginRateLimiter.js";
import {verifyEmailRateLimiter} from "../../middlewares/verifyEmailRateLimiter.js";


const router = Router();

router.post("/register", RegisterValidator, AuthController.register);
router.post("/login", LoginValidator, loginRateLimiter, AuthController.login);
router.get("/resetPassword/confirm", ResetTokenValidator, AuthController.resetPasswordConfirm);
router.patch("/resetPassword/updatePassword", ResetUpdatePasswordValidator, AuthController.resetUpdatePassword);
router.post("/resetPassword", ResetPasswordRequestValidator, AuthController.resetPasswordRequest);
router.get("/verifyEmail", verifyEmailRateLimiter, AuthController.verifyEmail);





export default router;
