import Joi from "joi";
import { Request, Response, NextFunction } from "express";

export default function validate(schema : Joi.Schema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
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
