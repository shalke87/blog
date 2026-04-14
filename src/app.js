import express from "express";
import apiRouter from "./api/apiRouter.js";
import errorHandler from "./api/middlewares/errorHandler.js";
import cors from "cors";
import path from "path";

const app = express();
app.use(cors(
    {
        origin: "http://localhost:5173", 
        credentials: true
    }
)); // Configura CORS per consentire richieste dal frontend in sviluppo
console.log("CORS configurato per http://localhost:5173");
app.use(express.json());

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
console.log("Static file serving configurato per /uploads:", path.join(process.cwd(), "uploads"));
app.use("", apiRouter);

// error handler (sempre per ultimo) 
app.use(errorHandler);

app.set("trust proxy", 1); // Imposta trust proxy per gestire correttamente gli IP in produzione dietro proxy


export default app;



