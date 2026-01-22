import UserRepository from '../repository/UserRepository.js';
import cryptoUtils from '../../infrastructure/security/cryptoUtils.js';
import ConflictError from '../errors/ConflictError.js';

export default {
    async register(data) {
        const { username, email, password } = data;
        const hashedPassword = await cryptoUtils.hashPassword(password);
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
    }
}