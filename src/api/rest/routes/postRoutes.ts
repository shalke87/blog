import { Router } from "express";
import postController from "../controllers/PostController.js";
import authenticateJWT from "../../middlewares/authMiddlewareJWT.js";
import optionalAuthMiddlewareJWT from "../../middlewares/optionalAuthMiddlewareJWT.js";
import postSchema from "../validators/postValidators/postValidatorSchema.js";
import idParamSchema from "../validators/postValidators/idParamValidatorSchema.js";
import paginationQuerySchema from "../validators/postValidators/paginationQueryValidatorSchema.js";
import postAndCommentIdsSchema from "../validators/postValidators/postAndCommentIdsValidatorSchema.js";
import commentSchema from "../validators/postValidators/commentValidatorSchema.js";
import validate from "../validators/BaseValidator.js";


const router = Router();

router.post("/add", authenticateJWT, validate(postSchema), postController.addPost);
router.patch("/update/:postId", authenticateJWT, validate(idParamSchema, "params"), validate(postSchema), postController.updatePost);
router.delete("/delete/:postId", authenticateJWT, validate(idParamSchema, "params"), postController.deletePost);
router.get("/listPublished", optionalAuthMiddlewareJWT, validate(paginationQuerySchema, "query"), postController.listPublished);
router.get("/listMine", authenticateJWT, validate(paginationQuerySchema, "query"), postController.listMine);
router.post("/:postId/comment", authenticateJWT, validate(idParamSchema, "params"), validate(commentSchema), postController.addComment);
router.patch("/:postId/comment/:commentId", authenticateJWT, validate(postAndCommentIdsSchema, "params"), validate(commentSchema), postController.updateComment);
router.delete("/:postId/comment/:commentId", authenticateJWT, validate(postAndCommentIdsSchema, "params"), postController.deleteComment);
router.patch("/:postId/like", authenticateJWT, validate(idParamSchema, "params"), postController.toggleLike);
router.get("/:postId", optionalAuthMiddlewareJWT, validate(idParamSchema, "params"), postController.getPostById);





export default router;
