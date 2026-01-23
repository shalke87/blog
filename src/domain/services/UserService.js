import UserRepository from '../repository/UserRepository.js';
import cryptoUtils from '../../infrastructure/security/cryptoUtils.js';
import UnauthorizedError from '../errors/UnauthorizedError.js';
import ConflictError from '../errors/ConflictError.js';

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
    }
}