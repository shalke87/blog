import Joi from "joi";
import validate from "./BaseValidator.js";

const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string()    
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/)
        .messages({ "string.pattern.base": "La password deve contenere almeno 8 caratteri, includere almeno una lettera maiuscola, una minuscola, un numero e un carattere speciale (es. !@#$%^&*)." })   
        .required()

});

export default {
    validate(payload) {
        return validate(schema, payload);
    }
};
