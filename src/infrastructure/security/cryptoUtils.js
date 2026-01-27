import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto, { hash, verify } from "crypto";

// da implementare tutte le funzioni crypto, hash, jwt ecc
export default {
    verifyToken(token, secret) {
        return jwt.verify(token, secret);
    },

    hashPassword(password) {
        return bcrypt.hashSync(password, parseInt(process.env.BCRYPT_SALT_ROUNDS));
    },

    hashData(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    },

    verifyHash(data, hash) {
        const dataHash = crypto.createHash('sha256').update(data).digest('hex');
        return dataHash === hash;
    },

    comparePassword(password, hashedPassword) {
        return bcrypt.compareSync(password, hashedPassword);
    },

    generateRandomToken() {
        return crypto.randomBytes(32).toString('hex');
    },

    generateJWT(payload) {
        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    },

    verifyJWT(token) {
        return jwt.verify(token, process.env.JWT_SECRET);
    }
};
