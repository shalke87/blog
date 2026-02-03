import cryptoUtils from "../../infrastructure/security/cryptoUtils.js";

export default function authMiddleware(socket, next) {
    try {
        const token = socket.handshake.auth.token;
        const decoded = cryptoUtils.verifyJWT(token);
        socket.userId = decoded.userId;
        next();
    } catch {
        next(new Error("Unauthorized"));
    }
}
