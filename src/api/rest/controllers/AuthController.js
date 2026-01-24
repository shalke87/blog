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
            res.status(200).json(result);
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
            const user = await UserService.resetPasswordConfirm(req.query);
            return res.json({ 
                message: "Valid reset token", 
                email: user.email });
        } catch (err) {
            next(err);
        }
    }
};
