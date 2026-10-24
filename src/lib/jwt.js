import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signToken(user) {
  const payload = {
    name: user.name,
    surname: user.surname,
    email: user.email,
    role: user.role,
    image: user.image,
  };
  return jwt.sign(payload, env.JWT_SECRET, {
    subject: user._id.toString(),
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}
