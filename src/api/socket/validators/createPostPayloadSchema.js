import Joi from "joi";
import postSchema from "../../rest/validators/postValidators/postValidatorSchema.js";

const createPostPayloadSchema = Joi.object({
    data: postSchema.required()
});

export default createPostPayloadSchema;