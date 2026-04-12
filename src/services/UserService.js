import config from '../../config/config.js';
import UserRepository from '../../src/domain/repository/UserRepository.js';
import NotFoundError from '../../src/domain/errors/NotFoundError.js';
import fs from 'fs';


class UserService {

    constructor(io = null) {
        this.io = io;
    }

    async uploadAvatar(userId, data) {
        console.log("Data received for uploadAvatar:", data);
        const fileName = data.filename;
        const avatarURL = config.AVATAR.PUBLIC_PATH + fileName; 
        // Salva il file sul server
        await fs.promises.writeFile(config.AVATAR.FILE_SYSTEM_PATH + fileName, data.buffer);
        // simula il salvataggio del file
        console.log(`Simulating file save to ${config.AVATAR.FILE_SYSTEM_PATH + fileName}`);
        const user = await UserRepository.updateUserById(userId, { avatarURL: avatarURL });
        if (!user) {
            throw new NotFoundError('User not found');
        }
        console.log("User found:", user);
        
        const {hashedPassword, ...userData} = user;
        return userData; //return user data without password
    }

    
}

export default UserService;