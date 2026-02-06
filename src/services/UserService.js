import UserRepository from '../domain/repository/UserRepository.js';
import cryptoUtils from '../infrastructure/security/cryptoUtils.js';
import UnauthorizedError from '../domain/errors/UnauthorizedError.js';
import ConflictError from '../domain/errors/ConflictError.js';
import config from '../../config/config.js';
import emailConfig from '../../config/emailConfig.js';
import EmailFactory from '../infrastructure/email/EmailFactory.js';
import BadRequestError from '../domain/errors/BadRequestError.js';
import NotFoundError from '../domain/errors/NotFoundError.js';

export default {
    async register(data) {
        console.log("Data received for registration:", data);  // da cancellare assolutamente
        const { username, email, password } = data;
        const hashedPassword = cryptoUtils.hashPassword(password);
        try{
            const result = await UserRepository.createUser({
                username,
                email,
                hashedPassword
            });
            return result;
        } catch (error) {
            if (error.code === 11000) { // Duplicate key error code for MongoDB    
                throw new ConflictError('Username or email already exists');
            }
            throw error;
        }
    },

    async login(data) {
        console.log("Data received for login:", data); // da cancellare assolutamente
        const { email, password } = data;
        const user = await UserRepository.findUserByEmail(email); 
        if (!user) {
            throw new UnauthorizedError('Email or password incorrect');
        }
        console.log("User found:", user);
        const isPasswordValid = cryptoUtils.comparePassword(password, user.hashedPassword);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Email or password incorrect');
        }

        const tokenJWT = cryptoUtils.generateJWT({ userId: user._id });
        console.log("Generated JWT token:", tokenJWT);
        const {hashedPassword, ...userData} = user;
        return {userData, tokenJWT}; //return and object with user data without password and the token
    },

    async getUserById(userId) {
        const user = await UserRepository.findUserById(userId);
        if (!user) {
            throw new NotFoundError('User not found');
        }
        const {hashedPassword, ...userData} = user;
        return userData; //return user data without password
    },

    async resetPasswordRequest(data) {
        const { email } = data;
        const resetToken = cryptoUtils.generateRandomToken();
        const hashedToken = cryptoUtils.hashData(resetToken);
        const expiration = new Date(Date.now() + config.TOKEN_RESET_TTL);
        
        const updatedUser = await UserRepository.storeResetToken(email, hashedToken, expiration); //se l'utente esiste aggiorna il token
        if (updatedUser) {
            // Send the reset token via email (implementation not shown here)
            await this.sendResetTokenEmail(email, resetToken);
        }
        // Always return success response to prevent email enumeration
        return { message: 'If the email exists, a reset token has been sent.' };
    },

    async resetPasswordConfirm(data) {
        console.log("Data received for resetPasswordConfirm:", data.token);
        const hashedToken = cryptoUtils.hashData(data.token);
            
        const user = await UserRepository.findUserByResetTokenAndDate(hashedToken, new Date());
        
        if (!user){
            console.log("No user found with the provided reset token. in service");
            throw new UnauthorizedError('Invalid or expired reset token');
        }

        const {hashedPassword, resetToken, resetTokenExpiration, ...userData} = user;
        return userData; //return user data without password
    },

    async resetUpdatePassword(data) {
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

    async updatePassword(userId, data) {
        console.log("Data received for updatePassword:", data);  // da cancellare assolutamente 
        const hashedOldPassword = cryptoUtils.hashPassword(data.oldPassword);
        const hashedNewPassword = cryptoUtils.hashPassword(data.newPassword);
        const user = await UserRepository.findUserBy({_id: userId});
        if(!user){
            console.log("User not found with userId:", userId);
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

        const {hashedPassword, resetToken, resetTokenExpiration, ...userData} = user;
        return userData; //return user data without password and reset stuff
    },

    async updateUsername(userId, data) {
        console.log("Data received for updateUsername:", data);
        const user = await UserRepository.updateUserById(userId, { username: data.username });
        if (!user) {
            throw new NotFoundError('User not found');
        }
        console.log("User found:", user);
        
        const {hashedPassword, ...userData} = user;
        return userData; //return user data without password
    },

    async uploadAvatar(userId, data) {
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

    async deleteAvatar(userId) {
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

    async sendResetTokenEmail(email, token) {
        const emailService = EmailFactory.create(emailConfig.provider);
        const text = `Clicca qui per reimpostare la password: ${process.env.SERVER_URL}/auth/resetPassword/confirm?token=${token}`;
        await emailService.send({
            to: email,
            subject: "Reset password",
            text: text
        });
    }
}