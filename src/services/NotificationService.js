import NotificationRepository from '../domain/repository/NotificationRepository.js';
import AuthService from './AuthService.js';

class NotificationService {
    constructor(io) {
        this.io = io;
    }

    async createPostNotification(to, from, postId, type) {  //genera notifiche per nuovi commenti o like su un post
        try{
            if(to.toString() === from.toString()) {
                console.log("Not sending notification to self for userId:", from);
                return; // Non inviare notifiche a se stessi
            }
            if (!this.io) {
                console.warn("Socket.io instance not available. Cannot emit notification.");
                return;
            }
            const fromUser = await AuthService.getUserById(from); // 1. Recupero dati dell'utente mittente
            if (type !== 'refresh') { // salvo la notifica solo se è un like o comento, se è un refresh emetto solo un evento per aggiornare la pagian real-time
                console.log("Creating notification for user:", to, "from user:", fromUser.username, "for postId:", postId, "with type:", type);
                const notification = await NotificationRepository.createNotification(to, from, postId, type); // 1. Salvataggio notifica nel database
                this.io.to(to._id.toString()).emit("notification:new", { id: notification._id.toString(), type, postId, fromUser: fromUser.username });  // 2. Emissione evento real-time 
                console.log("Notification emitted to user:", to, "with data:", { id: notification._id.toString(), type, postId, fromUser: fromUser });
            } else {
                this.io.to(to._id.toString()).emit("notification:new", { to, type, postId, fromUser: fromUser.username });  // 2. Emissione evento real-time 
            }
            
        } catch (error) {
            throw error;
        }
    }



    async sendPendingNotifications(userId, socket) {
        try{
            const notifications = await NotificationRepository.getNotificationsByUserIdAndReadStatus(userId, false); // Fetch unread notifications
            if(notifications.length === 0) {
                return 0; // No pending notifications, exit early
            }
            for (const notification of notifications) {
                console.log("Sending pending notification:", notification);
                socket.emit("notification:new", { 
                    type: notification.type, 
                    id: notification._id.toString(), // Include notification ID for reference
                    postId: notification.postId, 
                    fromUser: (await AuthService.getUserById(notification.fromUserId.toString())).username // Nella notifica mando lo username dell'utente trigger
                });
            }
            return notifications.length; // Return the number of notifications sent
        } catch (error) {
            console.error("Error sending pending notifications:", error);
        }
    }

    async markNotificationAsRead(notificationId) {
        try {
            const result = await NotificationRepository.markNotificationAsRead(notificationId);
            if (!result) {
                throw new Error("Notification not found");
            }
            return result;
        } catch (error) {
            console.error("Error marking notification as read:", error);
            throw error;
        }
    }

}

export default NotificationService;

