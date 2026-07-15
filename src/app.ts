import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import routes from './routes';
import { swaggerSpec } from './config/swagger';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { UPLOADS_ROOT, ensureUploadDirs } from './config/upload';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // File upload (disk) — folder dibuat saat boot & disajikan statis.
  // CORP cross-origin agar <img> dari frontend (port beda) tidak diblokir helmet.
  ensureUploadDirs();
  app.use(
    '/uploads',
    express.static(UPLOADS_ROOT, {
      setHeaders: (res) => res.set('Cross-Origin-Resource-Policy', 'cross-origin'),
    })
  );

  // Dokumentasi API
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));

  app.use('/api/v1', routes);

  // 404 + error handler global selalu terakhir.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
