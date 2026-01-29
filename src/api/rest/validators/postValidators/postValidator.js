import Joi from "joi";
import validate from "../BaseValidator.js";

const schema = Joi.object({
    title: Joi.string().min(3).max(30).optional(),
    content: Joi.string().min(10).optional(),
    status: Joi.string().valid("draft", "published").optional(),
    tags: Joi.array().items(
            Joi.string()
            .trim()
            .min(2)
            .max(15)
            .pattern(/^[A-Za-z][A-Za-z0-9]*$/) 
        )
        .optional()

});

export default validate(schema);
