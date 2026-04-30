import Joi from "joi";

const postIdPayloadSchema = Joi.object({
    postId: Joi.string().length(24).required()
});

export default postIdPayloadSchema;