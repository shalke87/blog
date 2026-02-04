import Joi from "joi";
import config from "../../../../../config/config.js";

const commentSchema = Joi.object({
    text: Joi.string().min(3).max(config.COMMENT.MAX_LENGTH).required()
}).required();

export default commentSchema;
