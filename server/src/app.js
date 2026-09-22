import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import authRouter from './routes/auth.routes.js';
import healthRouter from './routes/health.routes.js';
import memoryRouter from './routes/memory.routes.js';
import promptRouter from './routes/prompt.routes.js';
import profileRouter from './routes/profile.routes.js';
import publicRouter from './routes/public.routes.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  app.use('/api/health', healthRouter);
  app.use('/api/memories', memoryRouter);
  app.use('/api/prompts', promptRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/profile', profileRouter);
  app.use('/api/public', publicRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
