import Joi from "joi";
import validate from "../BaseValidator.js";

const schema = Joi.object({
   oldPassword: Joi.string()    
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/)
        .required(),
        
    newPassword: Joi.string()    
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/)
        .messages({ "string.pattern.base": "The new password must contain at least 8 characters, including at least one uppercase letter, one lowercase letter, one number, and one special character (e.g. !@#$%^&*)." })   
        .required()

});

export default validate(schema);
