import cryptoUtils from "../../infrastructure/security/cryptoUtils.js";
import NotificationService from "../../services/NotificationService.js"; // it's a singleton, so we can import it directly and use its methods without instantiating it again
import { Socket } from 'socket.io';

export default async function authMiddleware(socket : Socket, next: (err?: Error) => void) {
    try {
        const token = socket.handshake.auth.token;
        console.log("Received token:", token);
        const decoded = cryptoUtils.verifyJWT(token);
        if (typeof decoded === "string" || !decoded.userId) {
            throw new Error("Invalid token", { cause: decoded });
        }
        socket.userId = decoded.userId.toString(); // Store user ID in socket object for later use
        socket.join(socket.userId); // Join a room with the user ID
        await NotificationService.sendPendingNotifications(socket.userId, socket); // Send pending notifications on connection
        console.log("pending notifications sent to: ", socket.userId);
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        next(new Error("Unauthorized"));
    }
}
