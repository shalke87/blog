export default function validate(schema, payload) {
    const { value, error } = schema.validate(payload, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        const errorMessages = error.details.map(d => d.message);
        const err = new Error("Validation error");
        err.status = 400;
        err.details = errorMessages;
        throw err;
    }

    return value;
}
