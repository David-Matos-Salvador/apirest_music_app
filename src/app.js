import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middlewares/error-handler.js';
import { createApiRouter } from './routes/index.js';

export function createApp({ authRateLimit = env.NODE_ENV !== 'test' } = {}) {
  const app = express();

  app.disable('x-powered-by');
  // Detrás de un proxy (Render, Railway, Heroku...) para que el rate limit vea la IP real.
  app.set('trust proxy', 1);

  // Las imágenes y audios se consumen desde otro origen (el frontend), así que se permite.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: env.corsOrigins }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api', createApiRouter({ authRateLimit }));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
