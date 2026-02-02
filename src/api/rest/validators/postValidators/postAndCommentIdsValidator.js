import Joi from "joi";
import validate from "../BaseValidator.js";

const schema = Joi.object({
  postId: Joi.string().hex().length(24).required(),
  commentId: Joi.string().hex().length(24).required()
});

export default validate(schema, "params");
