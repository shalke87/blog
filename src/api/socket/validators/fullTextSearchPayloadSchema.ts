import Joi from "joi";
import config from "../../../config/config.js";

const fullTextSearchPayloadSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(config.PAGINATION.MAX_LIMIT).default(config.PAGINATION.DEFAULT_LIMIT),
  query: Joi.string().min(1).max(255).required()
}).default({ page: 1, limit: 10 }).allow(null);

export default fullTextSearchPayloadSchema;
