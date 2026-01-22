import Joi from "joi";
import validate from "./BaseValidator.js";

const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export default {
    validate(payload) {
        return validate(schema, payload);
    }
};
