import Joi from "joi";

const postAndCommentIdsSchema = Joi.object({
  postId: Joi.string().hex().length(24).required(),
  commentId: Joi.string().hex().length(24).required()
});

export default postAndCommentIdsSchema;
