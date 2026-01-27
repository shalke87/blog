import { Router } from "express";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);

export default router;
