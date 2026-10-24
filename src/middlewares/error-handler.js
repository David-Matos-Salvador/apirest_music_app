import mongoose from 'mongoose';
import { HttpError } from '../lib/http-error.js';

export function notFound(req, _res, next) {
  next(HttpError.notFound(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

// Express reconoce los manejadores de error por tener 4 parámetros: no quitar `_next`.
export function errorHandler(error, _req, res, _next) {
  if (error instanceof HttpError) {
    return res.status(error.status).json({ message: error.message });
  }
  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: `Valor no válido para "${error.path}"` });
  }
  if (error instanceof mongoose.Error.ValidationError) {
    const message = Object.values(error.errors)
      .map((e) => e.message)
      .join('; ');
    return res.status(400).json({ message });
  }
  if (error?.code === 11000) {
    return res.status(409).json({ message: 'El recurso ya existe' });
  }
  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'El cuerpo de la petición no es un JSON válido' });
  }

  console.error(error);
  res.status(500).json({ message: 'Error interno del servidor' });
}
