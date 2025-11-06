import { Express } from 'express';
import reportRouter from './report/index.js';

export function configureRoutes(app: Express): void {
  app.use('/report', reportRouter);
}
