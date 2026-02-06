import PostActions from "./actions/PostActions.js";
import NotificationActions from "./actions/NotificationActions.js";
import authMiddleware from "../middlewares/authMiddlewareSocket.js";

export default function socketApi(io) {
    io.use(authMiddleware);

    io.on("connection", (socket) => {
        new PostActions(socket, io); // Passa io a PostActions per poter emettere notifiche
        new NotificationActions(socket, io); // Passa io a NotificationActions per poter emettere notifiche
    });
}
