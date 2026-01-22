import UserService from "../../../domain/services/UserService.js";

export default {
    async register(data, res, next) {
        try {
            const result = await UserService.register(data);
            res.status(201).json(result);
        } catch (err) {
            next(err);
        }
    },

    async login(data, res, next) {
        try {
            const result = await UserService.login(data);
            res.json(result);
        } catch (err) {
            next(err);
        }
    }
};
