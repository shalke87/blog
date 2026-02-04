import Joi from "joi";

const postIdCommentIdPayloadSchema = Joi.object({
    postId: Joi.string().length(24).required(),
    commentId: Joi.string().length(24).required()
});

export default postIdCommentIdPayloadSchema;