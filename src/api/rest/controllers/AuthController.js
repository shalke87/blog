import UserService from "../../../domain/services/UserService.js";

export default {
    async register(req, res, next) {
        try {
            const result = await UserService.register(req.body);
            res.status(201).json(result);
        } catch (err) {
            next(err);
        }
    },

    async login(req, res, next) {
        try {
            const result = await UserService.login(req.body);
            res.status(200).json({
                user: result.userData,
                tokenJWT: result.tokenJWT,
                message: "Login successful"
            });
        } catch (err) {
            next(err);
        }
    },

    async updateUsername(req, res, next) {
        try {
            const result = await UserService.updateUsername(req.body);
            res.status(200).json({
                user: result.userData,
                message: "Username updated successfully."
            });
        } catch (err) {
            next(err);
        }
    },

    async resetPasswordRequest(req, res, next) {
        try {
            const result = await UserService.resetPasswordRequest(req.body);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    },

    async resetPasswordConfirm(req, res, next) {
        try {
            const result = await UserService.resetPasswordConfirm(req.query);
            return res.json({ 
                message: "Valid reset token", 
                email: result.email });
        } catch (err) {
            next(err);
        }
    },

    async resetUpdatePassword(req, res, next) {
        try {
            const result = await UserService.resetUpdatePassword(req.body);
            return res.status(200).json({ 
                message: "Password updated successfully.", 
                email: result.email });
        } catch (err) {
            next(err);
        }
    }
};
