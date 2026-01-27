import Joi from "joi";
import validate from "../BaseValidator.js";

const schema = Joi.object({
    username: Joi.string().min(3).max(30).required()
});

export default validate(schema);
