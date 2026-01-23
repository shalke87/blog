import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import RegisterValidator from "../validators/RegisterValidator.js";
import LoginValidator from "../validators/LoginValidator.js";

const router = Router();

router.post("/register", RegisterValidator, AuthController.register);
router.post("/login", LoginValidator, AuthController.login);
// router.post("/retrievePassword", RetrievePasswordValidator, AuthController.retrievePassword);




export default router;
