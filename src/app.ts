import express from 'express';
import http from 'http';
import config from './config/environment.js';
import { configureExpress } from './config/express.js';
import { configureRoutes } from './routes.js';

// Create Express app
const app = express();
const server = http.createServer(app);

// Configure Express middleware
configureExpress(app);

// Configure routes
configureRoutes(app);

// Start server
function startServer() {
  server.listen(config.port, () => {
    console.log(
      `Express server listening on port ${config.port} in ${config.nodeEnv} mode`
    );
  });
}

startServer();

export { app, server };
