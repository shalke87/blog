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
    }
};
