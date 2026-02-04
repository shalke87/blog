import Joi from "joi";
import commentSchema from "./commentSchema.js";

const postAndCommentIdsSchema = Joi.object({
  postId: Joi.string().hex().length(24).required(),
  commentId: Joi.string().hex().length(24).required(),
  data: commentSchema.required()
});

export default postAndCommentIdsSchema;
