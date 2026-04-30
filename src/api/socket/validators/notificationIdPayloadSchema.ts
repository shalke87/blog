import Joi from "joi";

const idPayloadSchema = Joi.object({
    notificationId: Joi.string().length(24).required()
});

export default idPayloadSchema;