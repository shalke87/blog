import Joi from "joi";
import validate from "./BaseValidator.js";

const schema = Joi.object({ token: Joi.string().length(64).hex().required() });

export default validate(schema, 'query');
