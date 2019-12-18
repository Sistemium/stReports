/**
 * Express configuration
 */

import express from 'express';
import morgan from 'morgan';
import compression from 'compression';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import errorHandler from 'errorhandler';
import path from 'path';
import config from './environment';

export default function (app) {
  const env = app.get('env');

  app.set('views', config.root + '/server/views');
  app.set('view engine', 'jade');
  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(methodOverride());

  if ('production' === env) {
    app.use(morgan('combined', {}));
  }

  if ('development' === env || 'test' === env) {
    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(morgan('combined', {}));
    app.use(errorHandler()); // Error handler - has to be last
  }
}
