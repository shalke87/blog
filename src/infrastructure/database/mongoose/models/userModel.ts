import mongoose, { Document } from "mongoose";
import authConfig from "../../../../config/authConfig.js";

// Interfaccia che descrive i dati dell'utente
export interface IUser extends Document {
    username: string;
    email: string;
    hashedPassword: string;
    resetToken?: string;
    resetTokenExpiration?: Date;
    createdAt: Date;
    avatarURL: string | null;
    status: string;
    emailVerificationToken?: string;
    emailVerificationTokenExpiration?: Date;
}

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            minlength: 3,
            maxlength: 30,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Email non valida"]
        },
        hashedPassword: {
            type: String,
            required: true
        },
        resetToken: {
            type: String,
            required: false
        },
        resetTokenExpiration: {
            type: Date,
            required: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        avatarURL: {
            type: String,
            default: null
        },

        status: {
            type: String,
            enum: [authConfig.USER_STATUS.ACTIVE, authConfig.USER_STATUS.PENDING, authConfig.USER_STATUS.BANNED, authConfig.USER_STATUS.SUSPENDED],
            default: authConfig.USER_STATUS.PENDING
        },

        emailVerificationToken: String,
        emailVerificationTokenExpiration: Date
    },
    {
        versionKey: false

    }
);

const UserModel = mongoose.model<IUser>("User", UserSchema);

export default UserModel;
