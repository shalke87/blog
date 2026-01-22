import PostActions from "./actions/PostActions.js";
import authMiddleware from "../middlewares/authMiddleware.js";

export default function socketApi(io) {
    io.use(authMiddleware);

    io.on("connection", (socket) => {
        PostActions(socket);
    });
}
