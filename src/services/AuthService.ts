import UserRepository from '../domain/repository/UserRepository.js';
import cryptoUtils from '../infrastructure/security/cryptoUtils.js';
import UnauthorizedError from '../domain/errors/UnauthorizedError.js';
import ConflictError from '../domain/errors/ConflictError.js';
import config from '../config/config.js';
import emailConfig from '../config/emailConfig.js';
import EmailFactory from '../infrastructure/email/EmailFactory.js';
import BadRequestError from '../domain/errors/BadRequestError.js';
import NotFoundError from '../domain/errors/NotFoundError.js';
import authConfig from '../config/authConfig.js';
import { PublicUser } from '../types/types.js';
import { User } from '../types/types.js';
import { MongoServerError } from 'mongodb';

export default {
    async register(data : { username: string, email: string, password: string }) : Promise<PublicUser> {
        const { username, email, password } = data;
        const hashedPassword = cryptoUtils.hashPassword(password);
        const verificationToken = cryptoUtils.generateRandomToken();
        const hashedVerificationToken = cryptoUtils.hashData(verificationToken);
        try{
            const result = await UserRepository.createUser({
                username,
                email,
                hashedPassword,
                emailVerificationToken: hashedVerificationToken,
                emailVerificationTokenExpiration: new Date(Date.now() + authConfig.EMAIL_VERIFICATION_TOKEN_TTL),
                status: authConfig.USER_STATUS.ACTIVE
            });
            const publicUser = this.toPublicUser(result);
            //await this.sendVerificationEmail(email, verificationToken);
            return publicUser;
        } catch (error) {
            console.log("Error in register service:", error);
            if (error instanceof MongoServerError && error.code === 11000) { // Duplicate key error code for MongoDB    
                throw new ConflictError('Username or email already exists');
            }
            throw error;
        }
    },

    async login(data : { email: string, password: string }) {
        const { email, password } = data;
        const user = await UserRepository.findUserByEmail(email); 
        if (!user || user.status !== authConfig.USER_STATUS.ACTIVE) {
            throw new UnauthorizedError('Email or password incorrect');
        }
        const isPasswordValid = cryptoUtils.comparePassword(password, user.hashedPassword);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Email or password incorrect');
        }
        const tokenJWT = cryptoUtils.generateJWT({ userId: user.id });
        const {hashedPassword, ...userData} = user;
        return {userData, tokenJWT}; //return and object with user data without password and the token
    },

    async getUserById(userId : string) {
        const user = await UserRepository.findUserById(userId);
        if (!user) {
            throw new NotFoundError('User not found');
        }
        const {hashedPassword, ...userData} = user;
        return userData; //return user data without password
    },

    async resetPasswordRequest(data : { email: string }) {
        const { email } = data;
        const resetToken = cryptoUtils.generateRandomToken();
        const hashedToken = cryptoUtils.hashData(resetToken);
        const expiration = new Date(Date.now() + authConfig.PASSWORD_RESET_TOKEN_TTL);
        
        const updatedUser = await UserRepository.storeResetToken(email, hashedToken, expiration); //se l'utente esiste aggiorna il token
        if (updatedUser) {
            // Send the reset token via email (implementation not shown here)
            await this.sendResetTokenEmail(email, resetToken);
        }
        // Always return success response to prevent email enumeration
        return { message: 'If the email exists, a reset token has been sent.' };
    },

    async resetPasswordConfirm(data : { token: string }) {
        console.log("Data received for resetPasswordConfirm:", data.token);
        const hashedToken = cryptoUtils.hashData(data.token);
            
        const user = await UserRepository.findUserByResetTokenAndDate(hashedToken, new Date());
        
        if (!user){
            console.log("No user found with the provided reset token. in service");
            throw new UnauthorizedError('Invalid or expired reset token');
        }

        return this.toPublicUser(user); //return user data without password and sensitive info
    },

    async resetUpdatePassword(data : { token: string, newPassword: string }) {
        console.log("Token received for resetUpdatePassword:", data.token);
        const hashedToken = cryptoUtils.hashData(data.token);
        const hashedNewPassword = cryptoUtils.hashPassword(data.newPassword);
        const user = await UserRepository.updateUserByResetTokenAndDate(hashedToken, new Date(), { 
            hashedPassword: hashedNewPassword,
            resetToken: null,
            resetTokenExpiration: null
        });
        
        if (!user){
            console.log("No user found with the provided reset token. in service");
            throw new UnauthorizedError('Invalid or expired reset token');
        }

        const {hashedPassword, resetToken, resetTokenExpiration, ...userData} = user;
        return userData; //return user data without password and reset stuff
    },

    async updatePassword(userId : string, data : { oldPassword: string, newPassword: string }) {
        const hashedNewPassword = cryptoUtils.hashPassword(data.newPassword);
        const user = await UserRepository.findUserBy({id: userId});
        if(!user){
            throw new NotFoundError('User not found');
        }
        const validPassword = cryptoUtils.comparePassword(data.oldPassword, user.hashedPassword);
        if (!validPassword){
            console.log("Old password does not match for userId:", userId);
            throw new BadRequestError('Old password is incorrect');
        }
        
        const updatedUser = await UserRepository.updateUserById(userId, { hashedPassword: hashedNewPassword });
        if (!updatedUser){
            console.log("Failed to update password for userId:", userId);
            throw new Error('Failed to update password');
        }

        const publicUser = this.toPublicUser(updatedUser);
        return publicUser; //return user data without password  

    },

    async updateUsername(userId : string, data : { username: string }): Promise<PublicUser> {
        console.log("Data received for updateUsername:", data);
        const user = await UserRepository.updateUserById(userId, { username: data.username });
        if (!user) {
            throw new NotFoundError('User not found');
        }
        console.log("User found:", user);
        
        const {hashedPassword, ...userData} = user;
        return userData; //return user data without password
    },

    async uploadAvatar(userId : string, data : { filename: string }): Promise<PublicUser> {
        console.log("Data received for uploadAvatar:", data);
        const fileName = data.filename;
        const avatarURL = config.AVATAR.PUBLIC_PATH + fileName; 
        const user = await UserRepository.updateUserById(userId, { avatarURL: avatarURL });
        if (!user) {
            throw new NotFoundError('User not found');
        }
        console.log("User found:", user);
        
        const {hashedPassword, ...userData} = user;
        return userData; //return user data without password
    },

    async deleteAvatar(userId : string): Promise<PublicUser> {
        console.log("Deleting avatar for userId:", userId);
        const user = await UserRepository.updateUserById(userId, { avatarURL: null });
        if (!user) {
            throw new NotFoundError('User not found');
        }
        console.log("User found:", user);
        //da implementare cancellazione file fisico se necessario        
        const {hashedPassword, ...userData} = user;
        return userData; //return user data without password
    },

    async sendResetTokenEmail(email : string, token : string) {
        const emailService = EmailFactory.create(emailConfig.provider);
        const text = `Clicca qui per reimpostare la password: ${process.env.SERVER_URL}/auth/resetPassword/confirm?token=${token}`;
        await emailService.send({
            to: email,
            subject: "Reset password",
            text: text
        });
    },

    async sendVerificationEmail(email : string, token : string) {
        const emailService = EmailFactory.create(emailConfig.provider);
        const text = `Clicca qui per verificare la tua email: ${process.env.SERVER_URL}/auth/verifyEmail?token=${token}`;
        await emailService.send({
            to: email,
            subject: "Verify your email",
            text: text
        });
    },

    async verifyEmail(token : string) {
        const hashedToken = cryptoUtils.hashData(token);
        const user = await UserRepository.findUserBy({ emailVerificationToken: hashedToken });
        if (!user) {
            throw new BadRequestError('Invalid or expired verification token');
        }
        if (user.emailVerificationTokenExpiration && user.emailVerificationTokenExpiration.getTime() < Date.now()) {
            throw new BadRequestError('Invalid or expired verification token');
        }
        const updatedUser = await UserRepository.updateUserById(user.id, {
            emailVerificationToken: null,
            emailVerificationTokenExpiration: null,
            status: authConfig.USER_STATUS.ACTIVE
        });
        console.log("Updated user after email verification:", updatedUser);
        if(!updatedUser) {
            throw new Error('Failed to verify email');
        }
        const publicUser = this.toPublicUser(updatedUser);
        return { userData: publicUser };
    },

    toPublicUser(user: User): PublicUser {
            const { id, username, email, avatarURL, status, createdAt } = user;
            return { id, username, email, avatarURL, status, createdAt };
        }

}