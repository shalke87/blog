import UserModel from "../../infrastructure/database/mongoose/models/userModel.js";

export default {
    async createUser(data) {
        console.log("Creating user with data:", data);
        try{
            const user = await UserModel.create(data);
            console.log("User created:", user);
            return user.toObject();
        } catch (error) {
            console.error("Error creating user:", error);
            throw error;
        }
    },

    async findUserBy(query) {
        console.log("Finding user with query:", query);
        try {
            const user = await UserModel.findOne(query);
            return user ? user.toObject() : null;
        } catch (error) {
            console.error("Error fetching user:", error);
            throw error;
        }
    },



    async updateUserById(userId, updateData) {
        console.log("Updating user for userId:", userId, "with data:", updateData);
        try{
            const user = await UserModel.findOneAndUpdate({ _id: userId }, updateData, { new: true});
            if(!user) {
                return null;
            }
            return user.toObject();
        } catch (error) {
            console.error("Error updating user:", error);
            throw error;
        }
    },



    async findUserByResetTokenAndDate(token, date) {
        try{
            console.log("Finding user with reset token:", token, date);
            const user = await UserModel.findOne({ resetToken: token, resetTokenExpiration: { $gt: date } });
            if(!user) {
                return null;
            }
            return user.toObject();
        } catch (error) {
            console.error("Error fetching user:", error);
            throw error;
        }
    },

    async updateUserByResetTokenAndDate(token, date, updateData) {
        try{
            console.log("Finding user with reset token for psw update:", token, date);
            const user = await UserModel.findOneAndUpdate({ resetToken: token, resetTokenExpiration: { $gt: date } }, updateData, { new: true });
            if(!user) {
                return null;
            }
            return user.toObject();
        } catch (error) {
            console.error("Error fetching user:", error);
            throw error;
        }
    },

    async storeResetToken(email, token, expiration) {
        console.log(`Storing hashed reset token for email: ${email}`, token, expiration);
        try {
            const result = await UserModel.findOneAndUpdate(
                { email },
                { resetToken: token, resetTokenExpiration: expiration },
                { new: true }
            );
            if (!result) {
                return null;
            }
            return result.toObject();
        } catch (error) {
            console.error("Error storing reset token:", error);
            throw error;
        }
    }
}