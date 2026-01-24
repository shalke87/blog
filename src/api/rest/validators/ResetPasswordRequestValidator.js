import Joi from "joi";
import validate from "./BaseValidator.js";

const schema = Joi.object({
    email: Joi.string().email().required(),
});

export default validate(schema);
