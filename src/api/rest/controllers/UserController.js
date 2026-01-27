import UserService from "../../../domain/services/UserService.js";

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
    }
};
