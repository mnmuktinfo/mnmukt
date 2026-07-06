'use strict';

const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const hpp = require('hpp');
const { filterXSS } = require('xss');

const mongoSanitize = require('./mongoSanitize.middleware');

const { env } = require('../config/env');
const { ApiError } = require('../utils/ApiError');

const ALLOWED_ORIGINS = [env.CLIENT_URL, env.ADMIN_URL].filter(Boolean);

function corsOptions() {
  return cors({
    origin(origin, callback) {
      // Allow server-to-server requests (no Origin header)
      if (!origin) {
        return callback(null, true);
      }

      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      return callback(new ApiError(403, 'Origin not allowed by CORS policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
}

function helmetOptions() {
  return helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginResourcePolicy: {
      policy: 'same-site',
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  });
}

function deepSanitize(value) {
  if (value == null) {
    return value;
  }

  if (typeof value === 'string') {
    return filterXSS(value);
  }

  if (Array.isArray(value)) {
    return value.map(deepSanitize);
  }

  if (typeof value === 'object') {
    for (const key of Object.keys(value)) {
      value[key] = deepSanitize(value[key]);
    }
  }

  return value;
}

function xssSanitizer(req, res, next) {
  if (req.body) {
    req.body = deepSanitize(req.body);
  }

  if (req.params) {
    req.params = deepSanitize(req.params);
  }

  // Express 5: mutate instead of replacing
  if (req.query) {
    deepSanitize(req.query);
  }

  next();
}

function applySecurityMiddleware(app) {
  app.use(helmetOptions());
  app.use(corsOptions());
  app.use(compression());

  // Express 5 compatible MongoDB injection protection
  app.use(mongoSanitize);

  // Prevent HTTP Parameter Pollution
  app.use(hpp());

  // XSS protection
  app.use(xssSanitizer);
}

module.exports = {
  applySecurityMiddleware,
};