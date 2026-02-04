import Joi from "joi";
import config from "../../../../config/config.js";

const paginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(config.PAGINATION.MAX_LIMIT).default(config.PAGINATION.DEFAULT_LIMIT)
}).default({ page: 1, limit: 10 }).allow(null);

export default paginationQuerySchema;
