import PostActions from "./actions/PostActions.js";
import authMiddleware from "../middlewares/authMiddlewareSocket.js";

export default function socketApi(io) {
    io.use(authMiddleware);

    io.on("connection", (socket) => {
        PostActions(socket);
    });
}
