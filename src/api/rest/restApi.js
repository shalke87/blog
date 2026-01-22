import { Router } from "express";
import authRoutes from "./routes/authRoutes.js";

const router = Router();

router.use("/auth", authRoutes);

export default router;
