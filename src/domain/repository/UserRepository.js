import UserModel from "../../infrastructure/database/mongoose/models/userModel.js";

export default {
    async createUser(data) {
        console.log("Creating user with data:", data);
        try{
            const result = await UserModel.create(data);
            return result;
        } catch (error) {
            console.error("Error creating user:", error);
            throw error;
        }
    }
}