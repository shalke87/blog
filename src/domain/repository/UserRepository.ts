import UserModel, { IUser } from "../../infrastructure/database/mongoose/models/userModel.js";
import { User } from "../../types/userTypes.js";




type UserToCreate = {
    username: string;
    email: string;
    hashedPassword: string;
    emailVerificationToken: string;
    emailVerificationTokenExpiration: Date;
    status: string;
}

export default {
    async createUser(data: UserToCreate): Promise<User> {
        console.log("Creating user with data:", data);
        try {
            const user: IUser = await UserModel.create(data);
            return this.toUser(user);
        } catch (error) {
            console.error("Error creating user:", error);
            throw error;
        }
    },

    async findUserBy(query: Partial<User>): Promise<User | null> {
        console.log("Finding user with query:", query);
        try {
            const { id, ...restQuery } = query;
            const mongoQuery = id ? { _id: id, ...restQuery } : restQuery; // Convert id to _id for MongoDB
            const user = await UserModel.findOne(mongoQuery);
            return user ? this.toUser(user) : null;
        } catch (error) {
            console.error("Error fetching user:", error);
            throw error;
        }
    },

    async findUserByEmail(email: string): Promise<User | null> {
        console.log("Finding user with email:", email);
        try {
            const user = await UserModel.findOne({ email });
            return user ? this.toUser(user) : null;
        } catch (error) {
            console.error("Error fetching user:", error);
            throw error;
        }
    },

    async findUserById(userId: string): Promise<User | null> {
        console.log("Finding user with ID:", userId);
        try {
            const user = await UserModel.findById(userId);
            return user ? this.toUser(user) : null;
        } catch (error) {
            console.error("Error fetching user:", error);
            throw error;
        }
    },



    async updateUserById(userId: string, updateData: Partial<User>): Promise<User | null> {
        console.log("Updating user for userId:", userId, "with data:", updateData);
        try {
            const user = await UserModel.findOneAndUpdate({ _id: userId }, updateData, { new: true });
            if (!user) {
                return null;
            }
            return this.toUser(user);
        } catch (error) {
            console.error("Error updating user:", error);
            throw error;
        }
    },



    async findUserByResetTokenAndDate(token: string, date: Date): Promise<User | null> {
        try {
            console.log("Finding user with reset token:", token, date);
            const user = await UserModel.findOne({ resetToken: token, resetTokenExpiration: { $gt: date } });
            if (!user) {
                return null;
            }
            return this.toUser(user);
        } catch (error) {
            console.error("Error fetching user:", error);
            throw error;
        }
    },

    async updateUserByResetTokenAndDate(token: string, date: Date, updateData: Partial<User>): Promise<User | null> {
        try {
            console.log("Finding user with reset token for psw update:", token, date);
            const user = await UserModel.findOneAndUpdate({ resetToken: token, resetTokenExpiration: { $gt: date } }, updateData, { new: true });
            if (!user) {
                return null;
            }
            return this.toUser(user);
        } catch (error) {
            console.error("Error fetching user:", error);
            throw error;
        }
    },

    async storeResetToken(email: string, token: string, expiration: Date): Promise<User | null> {
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
            return this.toUser(result);
        } catch (error) {
            console.error("Error storing reset token:", error);
            throw error;
        }
    },

    toUser(user: IUser): User {
        console.log("Converting IUser to User:", user);
        return {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            hashedPassword: user.hashedPassword,
            emailVerificationToken: user.emailVerificationToken,
            emailVerificationTokenExpiration: user.emailVerificationTokenExpiration,
            status: user.status,
            avatarURL: user.avatarURL,
            createdAt: user.createdAt
        };
    }
}