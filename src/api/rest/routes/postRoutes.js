import { Router } from "express";
import PostController from "../controllers/PostController.js";
import authenticateJWT from "../../middlewares/authMiddlewareJWT.js";
import optionalAuthMiddlewareJWT from "../../middlewares/optionalAuthMiddlewareJWT.js";
import postSchema from "../validators/postValidators/postValidatorSchema.js";
import idParamSchema from "../validators/postValidators/idParamValidatorSchema.js";
import paginationQuerySchema from "../validators/postValidators/paginationQueryValidatorSchema.js";
import postAndCommentIdsSchema from "../validators/postValidators/postAndCommentIdsValidatorSchema.js";
import commentSchema from "../validators/postValidators/commentValidatorSchema.js";
import validate from "../validators/BaseValidator.js";


const router = Router();

router.post("/add", authenticateJWT, validate(postSchema), PostController.addPost);
    router.patch("/update/:postId", authenticateJWT, validate(idParamSchema, "params"), validate(postSchema), PostController.updatePost);
    router.delete("/delete/:postId", authenticateJWT, validate(idParamSchema, "params"), PostController.deletePost);
    router.get("/listPublished", optionalAuthMiddlewareJWT, validate(paginationQuerySchema, "query"), PostController.listPublished);
    router.get("/listMine", authenticateJWT, validate(paginationQuerySchema, "query"), PostController.listMine);
    router.post("/:postId/comment", authenticateJWT, validate(idParamSchema, "params"), validate(commentSchema), PostController.addComment);
    router.patch("/:postId/comment/:commentId", authenticateJWT, validate(postAndCommentIdsSchema, "params"), validate(commentSchema), PostController.updateComment);
    router.delete("/:postId/comment/:commentId", authenticateJWT, validate(postAndCommentIdsSchema, "params"), PostController.deleteComment);
    router.patch("/:postId/like", authenticateJWT, validate(idParamSchema, "params"), PostController.toggleLike);
    router.get("/:postId", optionalAuthMiddlewareJWT, validate(idParamSchema, "params"), PostController.readPost);





export default router;
