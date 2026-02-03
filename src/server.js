import dotenv from "dotenv";
dotenv.config();
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import socketApi from "./api/socket/socketApi.js";
import { connectDB } from "./infrastructure/database/mongoose/db.js";
import createServer from "./createServer.js";

// Connessione al database
await connectDB();

// Creazione del server HTTP (REST) e del server Socket.IO
const { server, io } = createServer();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
