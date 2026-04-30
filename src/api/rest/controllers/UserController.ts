import AuthService from "../../../services/AuthService.js";
import { Request, Response, NextFunction } from "express";

export default {
    async updateUsername(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("Entering updateUsername controller with userId:", req.userId);
            if (!req.userId) {
                console.log("No userId found in request. User might not be authenticated - check authentication middleware.");
                return res.status(401).json({ message: "Unauthorized" });
            }
            const result = await AuthService.updateUsername(req.userId, req.body);
            res.status(200).json({...result, message: "Username updated successfully."});
        } catch (err) {
            next(err);
        }
    },

    async updatePassword(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("Entering updatePassword controller with userId:", req.userId);
            if (!req.userId) {
                console.log("No userId found in request. User might not be authenticated - check authentication middleware.");
                return res.status(401).json({ message: "Unauthorized" });
            }
            const result = await AuthService.updatePassword(req.userId, req.body);
            res.status(200).json({...result, message: "Password updated successfully."});
        } catch (err) {
            next(err);
        }
    },

    async uploadAvatar(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("Entering uploadAvatar controller with userId:", req.userId);
            if (!req.userId) {
                console.log("No userId found in request. User might not be authenticated - check authentication middleware.");
                return res.status(401).json({ message: "Unauthorized" });
            }
            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded." });
            }
            const result = await AuthService.uploadAvatar(req.userId, req.file);
            res.status(200).json({...result, message: "Avatar uploaded successfully."});
        } catch (err) {
            next(err);
        }
    },
    
    async deleteAvatar(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("Entering deleteAvatar controller with userId:", req.userId);
            if (!req.userId) {
                console.log("No userId found in request. User might not be authenticated - check authentication middleware.");
                return res.status(401).json({ message: "Unauthorized" });
            }
            const result = await AuthService.deleteAvatar(req.userId);
            res.status(200).json({...result, message: "Avatar deleted successfully."});
        } catch (err) {
            next(err);
        }
    }
};