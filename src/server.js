import dotenv from "dotenv";
dotenv.config();
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import socketApi from "./api/socket/socketApi.js";
import { connectDB } from "./infrastructure/database/mongoose/db.js";

// Connessione al database
await connectDB();

// Creazione del server HTTP e Socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

socketApi(io); // inizializza il server e monta middleware e actions


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
