import { Router } from "express";
import usernameValidator from "../validators/userValidators/usernameValidator.js";
import UserController from "../controllers/UserController.js";
import authenticateJWT from "../../middlewares/authMiddlewareJWT.js";
import updatePasswordValidator from "../validators/userValidators/updatePasswordValidator.js";
import uploadAvatarMiddleware from "../../middlewares/uploadAvatarMiddleware.js";
import uploadErrorHandler from "../../middlewares/uploadAvatarMiddlewareErrorHandler.js";


const router = Router();

router.patch("/updateUsername", authenticateJWT, usernameValidator, UserController.updateUsername);
router.patch("/updatePassword", authenticateJWT, updatePasswordValidator, UserController.updatePassword);
router.patch("/uploadAvatar", authenticateJWT, uploadErrorHandler(uploadAvatarMiddleware.single("avatar")), UserController.uploadAvatar);
router.delete("/deleteAvatar", authenticateJWT, UserController.deleteAvatar);





export default router;
