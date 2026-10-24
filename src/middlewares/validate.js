import { isValidObjectId } from 'mongoose';
import { HttpError } from '../lib/http-error.js';

/** Valida y normaliza `req.body` con un esquema de zod. */
export function validateBody(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
      const message = result.error.issues
        .map((i) => (i.path.length ? `${i.path.join('.')}: ${i.message}` : i.message))
        .join('; ');
      return next(HttpError.badRequest(message));
    }
    req.body = result.data;
    next();
  };
}

/** Rechaza la petición si alguno de los parámetros indicados no es un ObjectId válido. */
export function validateObjectId(...params) {
  return (req, _res, next) => {
    for (const param of params) {
      const value = req.params[param];
      if (value !== undefined && !isValidObjectId(value)) {
        return next(HttpError.badRequest(`El parámetro "${param}" no es un identificador válido`));
      }
    }
    next();
  };
}
