import UserModel from "../../infrastructure/database/mongoose/models/userModel.js";

export default {
    async createUser(data) {
        console.log("Creating user with data:", data);
        try{
            const result = await UserModel.create(data);
            console.log("User created:", result);
            return result.toObject();
        } catch (error) {
            console.error("Error creating user:", error);
            throw error;
        }
    },

    async findUserByEmail(email) {
        console.log("Finding user with email:", email);
        try{
            const result = await UserModel.findOne({ email });
            return result.toObject();
        } catch (error) {
            console.error("Error fetching user:", error);
            throw error;
        }
    }
}