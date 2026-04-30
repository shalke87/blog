import PostActions from "./actions/PostActions.js";
import NotificationActions from "./actions/NotificationActions.js";
import authMiddleware from "../middlewares/authMiddlewareSocket.js";
import UserActions from "./actions/UserActions.js";
import { Server, Socket } from "socket.io";
import NotificationService from "../../services/NotificationService.js"; // Import NotificationService singleton to initialize it with the Socket.IO instance in the auth middleware

export default function socketApi(io : Server) {
    NotificationService.setIo(io); // Initialize NotificationService with the Socket.IO instance

    io.use(authMiddleware);

    io.on("connection", (socket : Socket) => {
        new PostActions(socket, io); // Passa io a PostActions per poter emettere notifiche
        new NotificationActions(socket, io); // Passa io a NotificationActions per poter emettere notifiche
        new UserActions(socket, io); // Passa io a UserActions per poter emettere notifiche
    });
}
