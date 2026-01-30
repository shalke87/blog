import Joi from "joi";
import validate from "../BaseValidator.js";
import config from "../../../../../config/config.js";

const schema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(config.PAGINATION.MAX_LIMIT).default(config.PAGINATION.DEFAULT_LIMIT)
});

export default validate(schema, "query");
