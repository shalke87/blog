import Joi from "joi";
import postSchema from "../../rest/validators/postValidators/postValidatorSchema.js";

const updatePostPayloadSchema = Joi.object({
    postId: Joi.string().hex().length(24).required(), 
    data: postSchema.required()
});

export default updatePostPayloadSchema;
