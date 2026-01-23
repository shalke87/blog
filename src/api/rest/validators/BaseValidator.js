
export default function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      return next(error); // ✔ Joi intercetta l’errore
    }

    req.body = value; // body sanitizzato
    next();
  };
}
