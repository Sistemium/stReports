/**
 * Main application file
 */

'use strict';

import express from 'express';
import config from './config/environment';
import http from 'http';
import debug from 'debug';

debug.log = console.info.bind(console);

// Setup server
let app = express();
let server = http.createServer(app);

require('./config/express')(app);
require('./routes')(app);

// Start server
function startServer() {
  app.angularFullstack = server.listen(config.port, config.ip, function() {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
  });
}

setImmediate(startServer);

// Expose app
//noinspection JSUnresolvedVariable
exports = module.exports = app;
