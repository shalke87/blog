import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import RegisterValidator from "../validators/RegisterValidator.js";
import LoginValidator from "../validators/LoginValidator.js";

const router = Router();

router.post("/register", (req, res, next) => {
    const data = RegisterValidator.validate(req.body);
    AuthController.register(data, res, next);
});

router.post("/login", (req, res, next) => {
    const data = LoginValidator.validate(req.body);
    AuthController.login(data, res, next);
});

export default router;
