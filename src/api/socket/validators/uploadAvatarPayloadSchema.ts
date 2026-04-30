import Joi from "joi";

const uploadAvatarPayloadSchema = Joi.object({
    buffer: Joi.binary().required(),
    filename: Joi.string().required(),
    mimetype: Joi.string().required(),
    size: Joi.number().required()
});

export default uploadAvatarPayloadSchema;
