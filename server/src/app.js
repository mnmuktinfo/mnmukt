'use strict';

const express = require('express');
const pinoHttp = require('pino-http');

const { applySecurityMiddleware } = require('./middleware/security.middleware');
const { requestId } = require('./middleware/requestId.middleware');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const { logger } = require('./utils/logger');
const routes = require('./routes');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

// Request ID
app.use(requestId);

// Logger
app.use(
  pinoHttp({
    logger,
    customLogLevel: (req, res, err) =>
      err || res.statusCode >= 500 ? 'error' : 'info',
  })
);

// Body parsers
app.use(
  express.json({
    limit: '1mb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '1mb',
  })
);

// Security middleware (includes mongoSanitize)
applySecurityMiddleware(app);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api/v1', routes);

// Errors
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = { app };