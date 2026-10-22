export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }

  static badRequest(message = 'Petición inválida') {
    return new HttpError(400, message);
  }

  static unauthorized(message = 'No autenticado') {
    return new HttpError(401, message);
  }

  static forbidden(message = 'No tienes permiso para realizar esta acción') {
    return new HttpError(403, message);
  }

  static notFound(message = 'Recurso no encontrado') {
    return new HttpError(404, message);
  }

  static conflict(message = 'El recurso ya existe') {
    return new HttpError(409, message);
  }
}
