import { isValidObjectId } from 'mongoose';
import { z } from 'zod';

const objectId = z.string().refine(isValidObjectId, 'Identificador no válido');
const requiredText = (field) => z.string().trim().min(1, `${field} es obligatorio`);
const email = z.string().trim().toLowerCase().pipe(z.email('Email no válido'));

export const registerSchema = z.object({
  name: requiredText('El nombre'),
  surname: requiredText('El apellido'),
  email,
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

// Solo se permiten estos campos: el rol, la imagen y la contraseña no se modifican por aquí.
export const updateUserSchema = registerSchema.pick({ name: true, surname: true, email: true }).partial();

export const artistSchema = z.object({
  name: requiredText('El nombre'),
  description: z.string().trim().default(''),
});

export const albumSchema = z.object({
  title: requiredText('El título'),
  description: z.string().trim().default(''),
  year: z.coerce.number().int().min(1900).max(2100),
  artist: objectId,
});

export const songSchema = z.object({
  number: z.coerce.number().int().min(1),
  name: requiredText('El nombre'),
  duration: z.string().trim().default(''),
  album: objectId,
});

/** Para actualizaciones: todos los campos opcionales y sin valores por defecto. */
export const partial = (schema) =>
  z.object(
    Object.fromEntries(
      Object.entries(schema.shape).map(([key, value]) => [
        key,
        (value instanceof z.ZodDefault ? value.unwrap() : value).optional(),
      ]),
    ),
  );
