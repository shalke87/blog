import NotificationService from "../../../services/NotificationService.js";
import notificationIdPayloadSchema from "../validators/notificationIdPayloadSchema.js";
import { Server, Socket } from "socket.io";

class NotificationActions {
    private socket: Socket;
    private io: Server;

    constructor(socket: Socket, io: Server) {
        this.socket = socket;
        this.io = io;
        this.registerEvents();
    }

    registerEvents() {
        this.socket.on("notification:markAsRead", this.markAsRead.bind(this));
    }

    async markAsRead(payload : { notificationId: string }, ack : (response : { success: boolean; message: string; error?: string }) => void) {
        try {
            const {error, value} = notificationIdPayloadSchema.validate(payload);
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }
            const { notificationId } = value;
            const result = await NotificationService.markNotificationAsRead(notificationId);
            ack({ success: true, message: "Notification marked as read." });
        } catch (error) {
            console.error("Error marking notification as read:", error);
            const message = error instanceof Error ? error.message : "Failed to mark notification as read.";
            ack({ success: false, message, error: message });
        }
    }
    
}

export default NotificationActions;

   
