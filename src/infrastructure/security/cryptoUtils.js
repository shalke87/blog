import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// da implementare tutte le funzioni crypto, hash, jwt ecc
export default {
    verifyToken(token, secret) {
        return jwt.verify(token, secret);
    },

    hashPassword(password) {
        return bcrypt.hashSync(password, parseInt(process.env.BCRYPT_SALT_ROUNDS));
    }
};
