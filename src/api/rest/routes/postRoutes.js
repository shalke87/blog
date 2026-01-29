import { Router } from "express";
import PostController from "../controllers/PostController.js";
import postValidator from "../validators/postValidators/postValidator.js";
import authenticateJWT from "../../middlewares/authMiddlewareJWT.js";
import idParamValidator from "../validators/postValidators/idParamValidator.js";
import optionalAuthMiddlewareJWT from "../../middlewares/optionalAuthMiddlewareJWT.js";



const router = Router();

router.post("/add", authenticateJWT, postValidator, PostController.addPost);
router.patch("/update/:postId", authenticateJWT, idParamValidator, postValidator, PostController.updatePost);
router.delete("/delete/:postId", authenticateJWT, idParamValidator, PostController.deletePost);
router.get("/read/:postId", optionalAuthMiddlewareJWT, idParamValidator, PostController.readPost);






export default router;
