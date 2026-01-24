import UserRepository from '../repository/UserRepository.js';
import cryptoUtils from '../../infrastructure/security/cryptoUtils.js';
import UnauthorizedError from '../errors/UnauthorizedError.js';
import ConflictError from '../errors/ConflictError.js';
import config from '../../../config/config.js';
import emailConfig from '../../../config/emailConfig.js';
import EmailFactory from '../../infrastructure/email/EmailFactory.js';
import BadRequestError from '../errors/BadRequestError.js';

export default {
    async register(data) {
        console.log("Data received for registration:", data);
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
        console.log("Data received for login:", data);
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
            throw new BadRequestError('Invalid or expired reset token');
        }

        const {hashedPassword, resetToken, resetTokenExpiration, ...userData} = user;
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