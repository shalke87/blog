import cryptoUtils from "../../infrastructure/security/cryptoUtils.js";

export default function authMiddleware(socket, next) {
    try {
        const token = socket.handshake.auth.token;
        socket.user = cryptoUtils.verifyToken(token);
        next();
    } catch {
        next(new Error("Unauthorized"));
    }
}
