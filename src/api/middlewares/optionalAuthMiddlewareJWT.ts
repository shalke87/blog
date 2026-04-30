import cryptoUtils from "../../infrastructure/security/cryptoUtils.js";
import { Request, Response, NextFunction } from "express";

export default function authenticateJWT(req: Request, res: Response, next: NextFunction) {
    console.log("Authenticating JWT...");
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        next(); // Proceed without authentication
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = cryptoUtils.verifyJWT(token);
        req.userId = decoded.userId; // contiene userId
        next();
    } catch (err) {
        next(); // Proceed without authentication
        return;
    }
}
