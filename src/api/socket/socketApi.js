import { verifyToken } from "../../utils/jwt.js";
import PostActions from "./actions/PostActions.js";

export default function socketApi(io) {
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            socket.user = verifyToken(token);
            next();
        } catch {
            next(new Error("Unauthorized"));
        }
    });

    io.on("connection", (socket) => {
        PostActions(socket);
    });
}
