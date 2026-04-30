import cryptoUtils from "../../infrastructure/security/cryptoUtils.js";
import { Request, Response, NextFunction } from "express";

export default function authenticateJWT(req: Request, res: Response, next: NextFunction) {
    console.log("Authenticating JWT...");
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = cryptoUtils.verifyJWT(token);
        req.userId = decoded.userId; // contiene userId
        next();
    } catch (err) {
        return res.status(401).json({ message: "Missing or invalid token" });
    }
}
