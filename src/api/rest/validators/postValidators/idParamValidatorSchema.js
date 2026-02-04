import Joi from "joi";

const idParamSchema = Joi.object({
  postId: Joi.string().hex().length(24).required(),
});

export default idParamSchema;
