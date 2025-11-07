import express, { Express } from 'express';
import compression from 'compression';
import cors from 'cors';

export function configureExpress(app: Express): void {
  // Body parsing middleware (built-in in Express 5+)
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

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
