import Joi from "joi";
import validate from "../BaseValidator.js";

const schema = Joi.object({ 
    token: Joi.string().length(64).hex().required(),
    newPassword: Joi.string()    
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/)
            .messages({ "string.pattern.base": "La password deve contenere almeno 8 caratteri, includere almeno una lettera maiuscola, una minuscola, un numero e un carattere speciale (es. !@#$%^&*)." })   
            .required()
});

export default validate(schema);
