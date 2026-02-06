import NotificationModel from "../../infrastructure/database/mongoose/models/notificationModel.js";

export default {
    async createNotification(to, from, postId, type) {
        console.log("Creating notification with data:", { to, from, postId, type });
        try{
            const notification = await NotificationModel.create(
                { 
                    toUserId: to, 
                    fromUserId: from, 
                    postId, 
                    type,
                    read: false
                }
            );
            return notification.toObject();
        } catch (error) {
            console.error("Error creating notification:", error);
            throw error;
        }
    },

    async getNotificationsByUserIdAndReadStatus(userId, readStatus) {
        try{
            const notifications = await NotificationModel.find({ toUserId: userId, read: readStatus }).lean();
            return notifications;
        } catch (error) {
            console.error("Error fetching notifications:", error);
            throw error;
        }
    }
    
}