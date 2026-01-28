import UserService from "../../../services/UserService.js";

export default {
    async updateUsername(req, res, next) {
        try {
            console.log("Entering updateUsername controller with userId:", req.userId);
            const result = await UserService.updateUsername(req.userId, req.body);
            result.message = "Username updated successfully.";
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    },

    async updatePassword(req, res, next) {
        try {
            console.log("Entering updatePassword controller with userId:", req.userId);
            const result = await UserService.updatePassword(req.userId, req.body);
            result.message = "Password updated successfully.";
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    },

    async uploadAvatar(req, res, next) {
        try {
            console.log("Entering uploadAvatar controller with userId:", req.userId);
            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded." });
            }
            const result = await UserService.uploadAvatar(req.userId, req.file);
            result.message = "Avatar uploaded successfully.";
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    },
    
    async deleteAvatar(req, res, next) {
        try {
            console.log("Entering deleteAvatar controller with userId:", req.userId);
            const result = await UserService.deleteAvatar(req.userId);
            result.message = "Avatar deleted successfully.";
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }
};