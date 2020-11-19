/**
 * Main application routes
 */

'use strict';

import cors from 'cors';
import report from './report';

export default function(app) {
  // Insert routes below

  app.use(cors({
    allowedHeaders: [
      'Authorization',
      'Content-Type',
    ],
    exposedHeaders: ['Location', 'Content-Disposition', 'Content-Type'],
  }));


  app.use('/report', report);

}
