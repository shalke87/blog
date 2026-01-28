import Joi from "joi";
import validate from "../BaseValidator.js";

const schema = Joi.object({
  postId: Joi.string().hex().length(24)
});

export default validate(schema, "params");
