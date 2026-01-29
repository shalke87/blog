import cryptoUtils from "../../infrastructure/security/cryptoUtils.js";

export default function authenticateJWT(req, res, next) {
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
