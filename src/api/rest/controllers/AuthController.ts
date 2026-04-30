import AuthService from "../../../services/AuthService.js";
import { Request, Response, NextFunction } from "express";

export default {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("Request Body:", req.body);
            const result = await AuthService.register(req.body);
            res.status(201).json(result);
        } catch (err) {
            next(err);
        }
    },

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await AuthService.login(req.body);
            res.status(200).json({
                user: result.userData,
                tokenJWT: result.tokenJWT,
                message: "Login successful"
            });
        } catch (err) {
            next(err);
        }
    },

    async updateUsername(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("Body della request in updateUsername controller:", req.body);
            req.body.newUsername = req.body.username; // Mappa username a newUsername per compatibilità con il service
            if(!req.userId) {
                console.log("No userId found in request. User might not be authenticated - check authentication middleware.");
                return res.status(401).json({ message: "Unauthorized" });
            }
            const result = await AuthService.updateUsername(req.userId, { username: req.body.newUsername });
            res.status(200).json({
                user: result,
                message: "Username updated successfully."
            });
        } catch (err) {
            next(err);
        }
    },

    async updatePassword(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("Body della request in updatePassword controller:", req.body);
            if(!req.userId) {
                console.log("No userId found in request. User might not be authenticated - check authentication middleware.");
                return res.status(401).json({ message: "Unauthorized" });
            }
            const result = await AuthService.updatePassword(req.userId, req.body);
            res.status(200).json({
                user: result,
                message: "Password updated successfully."
            });
        } catch (err) {
            next(err);
        }
    },

    async resetPasswordRequest(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await AuthService.resetPasswordRequest(req.body);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    },

    async resetPasswordConfirm(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await AuthService.resetPasswordConfirm({ token: req.query.token as string });
            return res.json({ 
                message: "Valid reset token", 
                email: result.email });
        } catch (err) {
            next(err);
        }
    },

    async resetUpdatePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await AuthService.resetUpdatePassword(req.body);
            return res.status(200).json({ 
                message: "Password updated successfully.", 
                email: result.email });
        } catch (err) {
            next(err);
        }
    },

    async verifyEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await AuthService.verifyEmail(req.query.token as string);
            return res.status(200).json({ 
                message: "Email verified successfully.", 
                user: result.userData });
        } catch (err) {
            next(err);
        }
    }
};
