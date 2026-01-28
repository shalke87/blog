import Joi from "joi";
import validate from "../BaseValidator.js";

const schema = Joi.object({
    title: Joi.string().min(3).max(30).optional(),
    content: Joi.string().min(10).optional(),
    status: Joi.string().valid("draft", "published").optional(),
    tags: Joi.array().items(Joi.string().hex().length(24)).optional()
});

export default validate(schema);
