
export default function validate(schema, source = 'body') {
  return (req, res, next) => {
    const data = req[source];
    console.log(`Validating request ${source}:`, data);   //da togliere in produzione
    const { error, value } = schema.validate(data, { abortEarly: false });



    if (error) {
      return next(error); // ✔ Joi intercetta l’errore
    }

    if (source === "query" || source === "params") { 
      Object.assign(req[source], value); 
    } else { 
      req[source] = value; // body è scrivibile 
    }
    next();
  };
}
