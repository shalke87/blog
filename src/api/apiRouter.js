import { Router } from "express";
import restApi from "./rest/restApi.js";

const router = Router();

router.use("/", restApi);

router.get("/health-check", (req, res, next) => {       // aggiunta endpoint di health-check
    res.status(200).json("Server is alive");
});

export default router;
