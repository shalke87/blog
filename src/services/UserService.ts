import config from '../config/config.js';
import UserRepository from '../domain/repository/UserRepository.js';
import NotFoundError from '../domain/errors/NotFoundError.js';
import fs from 'fs';
import { PublicUser, UploadAvatarPayload, User } from '../types/types.js';
import { IUser } from '../infrastructure/database/mongoose/models/userModel.js';
import { Server } from 'socket.io';

class UserService {
    private io : Server | null;

    constructor(io : Server | null = null) {
        this.io = io;
    }

    async uploadAvatar(userId : string , data : UploadAvatarPayload) : Promise<PublicUser> {
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
        
        const userData : PublicUser = this.toPublicUser(user);
        return userData
    }

    toPublicUser(user: User): PublicUser {
        const { id, username, email, avatarURL, status, createdAt } = user;
        return { id, username, email, avatarURL, status, createdAt };
    }

}

export default UserService;