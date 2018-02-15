/**
 * Main application routes
 */

'use strict';

import cors from 'cors';
import path from 'path';
import fs from 'fs';

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

  app.use('/report', require('./report'));
  app.use('/api/log', require('./api/logs'));

  // All undefined asset or api routes should return a 404
  //app.route('/:url(api|auth|components|app|bower_components|assets)/*')
  // .get(errors[404]);
  //
  //// All other routes should redirect to the index.html
  //app.route('/*')
  //  .get((req, res) => {
  //    res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
  //  });

  app.route('/files/:filename')
    .get((req, res) => {
      var file = path.join(__dirname , 'report/files', req.params.filename);
      var filestream = fs.createReadStream(file);
      filestream.pipe(res);
    });
}
