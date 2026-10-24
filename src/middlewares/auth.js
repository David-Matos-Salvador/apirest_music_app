import { HttpError } from '../lib/http-error.js';
import { verifyToken } from '../lib/jwt.js';
import { ROLES } from '../models/user.js';

function extractToken(header) {
  if (!header) return null;
  // Acepta "Bearer <token>" y, por compatibilidad con clientes antiguos, el token sin prefijo.
  const token = header.startsWith('Bearer ') ? header.slice(7) : header;
  return token.replace(/['"]+/g, '').trim() || null;
}

export function requireAuth(req, _res, next) {
  const token = extractToken(req.headers.authorization);
  if (!token) {
    return next(HttpError.unauthorized('La petición no tiene la cabecera de autenticación'));
  }

  try {
    const payload = verifyToken(token);
    req.user = { ...payload, id: payload.sub };
    next();
  } catch (error) {
    const message = error.name === 'TokenExpiredError' ? 'El token ha expirado' : 'Token no válido';
    next(HttpError.unauthorized(message));
  }
}

export function requireAdmin(req, _res, next) {
  if (req.user?.role !== ROLES.ADMIN) {
    return next(HttpError.forbidden());
  }
  next();
}
