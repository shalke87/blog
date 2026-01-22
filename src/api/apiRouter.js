import { Router } from "express";
import rest from "./rest/index.js";

const router = Router();

router.use("/rest", rest);

export default router;
