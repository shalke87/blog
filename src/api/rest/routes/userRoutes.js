import { Router } from "express";
import usernameValidator from "../validators/userValidators/usernameValidator.js";
import UserController from "../controllers/UserController.js";
import authenticateJWT from "../../middlewares/authMiddlewareJWT.js";
import updatePasswordValidator from "../validators/userValidators/updatePasswordValidator.js";


const router = Router();

router.patch("/updateUsername", authenticateJWT, usernameValidator, UserController.updateUsername);
router.patch("/updatePassword", authenticateJWT, updatePasswordValidator, UserController.updatePassword);





export default router;
