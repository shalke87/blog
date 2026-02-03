import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import socketApi from "./api/socket/socketApi.js";

function createServer() {
    const server = http.createServer(app);
    const io = new Server(server, {
        cors: { origin: "*" }
    });

    //registra middleware e actions
    socketApi(io);

    return { server, io };
}

export default createServer;
