import Joi from "joi";
import config from "../../../../../config/config.js";

const postSchema = Joi.object({
    title: Joi.string().min(3).max(30).required(),
    content: Joi.string().min(10).required(),
    status: Joi.string().valid(config.POST_STATUS.DRAFT, config.POST_STATUS.PUBLISHED).optional(),
    tags: Joi.array().items(
            Joi.string()
            .trim()
            .min(2)
            .max(15)
            .pattern(/^[A-Za-z][A-Za-z0-9]*$/) 
        )
        .optional()

});

export default postSchema;
