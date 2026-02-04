import Joi from "joi";

const idPayloadSchema = Joi.object({
    postId: Joi.string().length(24).required()
});

export default idPayloadSchema;