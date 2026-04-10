import NotificationService from "../../../services/NotificationService.js";
import notificationIdPayloadSchema from "../validators/notificationIdPayloadSchema.js";

class NotificationActions {
    
    constructor(socket, io) {
        this.socket = socket;
        this.io = io;
        this.NotificationService = new NotificationService(io); // Passa io a NotificationService per poter emettere notifiche
        this.registerEvents();
    }

    registerEvents() {
        this.socket.on("notification:markAsRead", this.markAsRead.bind(this));
    }

    async markAsRead(payload, ack) {
        try {
            const {error, value} = notificationIdPayloadSchema.validate(payload);
            if(error) {
                throw new Error("Validation error: " + error.details.map(d => d.message).join(", "));
            }
            const { notificationId } = value;
            const result = await this.NotificationService.markNotificationAsRead(notificationId);
            ack({ success: true, message: "Notification marked as read." });
        } catch (error) {
            console.error("Error marking notification as read:", error);
            ack({ success: false, message: "Failed to mark notification as read.", error: error.message });
        }
    }
    
}

export default NotificationActions;

   
