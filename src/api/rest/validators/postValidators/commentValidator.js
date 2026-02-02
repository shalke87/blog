import Joi from "joi";
import validate from "../BaseValidator.js";
import config from "../../../../../config/config.js";

const schema = Joi.object({
    text: Joi.string().min(3).max(config.COMMENT.MAX_LENGTH).required()
}).required();

export default validate(schema);
