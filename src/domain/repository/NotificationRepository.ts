import NotificationModel from "../../infrastructure/database/mongoose/models/notificationModel.js";
import { INotification } from "../../infrastructure/database/mongoose/models/notificationModel.js";

export default {
    async createNotification(to : string, from: string, postId: string, type: string) {
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

    async getNotificationsByUserIdAndReadStatus(userId: string, readStatus: boolean) {
        try{
            const notifications = await NotificationModel.find({ toUserId: userId, read: readStatus }).lean();
            return notifications;
        } catch (error) {
            console.error("Error fetching notifications:", error);
            throw error;
        }
    },

    async markNotificationAsRead(notificationId: string) {
        try {
            const result = await NotificationModel.findByIdAndUpdate({ _id: notificationId }, { read: true }, { new: true }).lean();
            return result;
        } catch (error) {
            console.error("Error marking notification as read:", error);
            throw error;
        }
    }
    
}