import express from "express";
import apiRouter from "./api/apiRouter.js";
import errorHandler from "./api/middlewares/errorHandler.js";

const app = express();
app.use(express.json());

app.use("", apiRouter);

// error handler (sempre per ultimo) 
app.use(errorHandler);

export default app;



