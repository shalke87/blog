import express from "express";
import http from "http";
import { Server } from "socket.io";

import apiRouter from "./api/apiRouter.js";
import socketApi from "./api/socket/socketApi.js";

const app = express();
app.use(express.json());

// REST
app.use("/api", apiRouter);

// SOCKET.IO
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

socketApi(io);

export default server;
