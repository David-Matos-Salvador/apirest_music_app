import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI es obligatorio'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET debe tener al menos 16 caracteres'),
  JWT_EXPIRES_IN: z.string().default('30d'),
  CORS_ORIGIN: z.string().default('*'),
  UPLOAD_DIR: z.string().default('upload'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`);
  console.error(`Configuración de entorno inválida:\n${issues.join('\n')}`);
  process.exit(1);
}

export const env = Object.freeze({
  ...parsed.data,
  corsOrigins:
    parsed.data.CORS_ORIGIN === '*' ? '*' : parsed.data.CORS_ORIGIN.split(',').map((o) => o.trim()),
});
