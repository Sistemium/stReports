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
      'Page-Size', 'Start-Page',
      'X-Page-Size', 'X-Start-Page',
      'X-Return-Post',
      'Authorization',
      'ETag', 'Content-Type'
    ],
    exposedHeaders: ['Location']
  }));


  app.use('/report', report);

}
