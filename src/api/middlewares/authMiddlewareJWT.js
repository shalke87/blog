import cryptoUtils from "../../infrastructure/security/cryptoUtils.js";

export default function authenticateJWT(req, res, next) {
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
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}
