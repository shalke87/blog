import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import socketApi from "./api/socket/socketApi.js";

function createServer() {
    const server = http.createServer(app);
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        }, // Configura CORS per consentire richieste dal frontend in sviluppo
        maxHttpBufferSize: 5e6 // 5 MB
    });

    //registra middleware e actions
    socketApi(io);

    return { server, io };
}

export default createServer;
