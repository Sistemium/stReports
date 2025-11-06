import { Express } from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';

export function configureExpress(app: Express): void {
  // Body parsing middleware
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  // Compression middleware
  app.use(compression());

  // CORS configuration
  app.use(
    cors({
      allowedHeaders: ['Authorization', 'Content-Type'],
      exposedHeaders: ['Location', 'Content-Disposition', 'Content-Type'],
    })
  );
}
