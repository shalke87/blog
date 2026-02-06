import cryptoUtils from "../../infrastructure/security/cryptoUtils.js";
import NotificationService from "../../services/NotificationService.js";

export default async function authMiddleware(socket, next) {
    try {
        const token = socket.handshake.auth.token;
        const decoded = cryptoUtils.verifyJWT(token);
        socket.userId = decoded.userId;
        socket.join(socket.userId.toString()); // Join a room with the user ID
        const notificationService = new NotificationService();
        await notificationService.sendPendingNotifications(socket.userId, socket); // Send pending notifications on connection
        console.log("pending notifications sent to: ", socket.userId);
        next();
    } catch {
        next(new Error("Unauthorized"));
    }
}
