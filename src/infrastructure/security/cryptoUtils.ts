import bcrypt from "bcrypt";
import crypto from "crypto";
import authConfig from "../../config/authConfig.js";
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

// da implementare tutte le funzioni crypto, hash, jwt ecc
export default {
    verifyToken(token: string, secret: string) {
        return jwt.verify(token, secret);
    },

    hashPassword(password: string) {
        return bcrypt.hashSync(password, authConfig.BCRYPT_SALT_ROUNDS);
    },

    hashData(data: string) {
        return crypto.createHash('sha256').update(data).digest('hex');
    },

    verifyHash(data: string, hash: string) {
        const dataHash = crypto.createHash('sha256').update(data).digest('hex');
        return dataHash === hash;
    },

    comparePassword(password: string, hashedPassword: string) {
        return bcrypt.compareSync(password, hashedPassword);
    },

    generateRandomToken() {
        return crypto.randomBytes(32).toString('hex');
    },

    generateJWT(payload: { userId: string }) {
        console.log("payload:", payload, "secret:", authConfig.JWT_SECRET, "expiresIn:", authConfig.JWT_EXPIRES_IN);
        return jwt.sign(payload, authConfig.JWT_SECRET as string, { expiresIn: authConfig.JWT_EXPIRES_IN } as SignOptions);
    },

    verifyJWT(token: string): { userId: string } {
        return jwt.verify(token, authConfig.JWT_SECRET as string) as JwtPayload & { userId: string };
    }
};
