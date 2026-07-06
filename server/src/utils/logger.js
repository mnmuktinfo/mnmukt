'use strict';

const pino = require('pino');
const { env } = require('../config/env');

const logger = pino({
  level: env.IS_PROD ? 'info' : 'debug',
  redact: {
    // Never let secrets or PII leak into logs
    paths: [
      'req.headers.authorization',
      '*.password',
      '*.razorpaySignature',
      '*.privateKey',
      '*.token',
      'req.body.password',
    ],
    censor: '[REDACTED]',
  },
  transport: env.IS_PROD
    ? undefined
    : { target: 'pino-pretty', options: { colorize: true } },
});

module.exports = { logger };