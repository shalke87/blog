import dotenv from "dotenv";
dotenv.config();

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
