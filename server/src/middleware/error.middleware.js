'use strict';

const { ApiError } = require('../utils/ApiError');
const { logger } = require('../utils/logger');
const { env } = require('../config/env');

function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;
  const message = isApiError ? err.message : 'Internal server error';

  const logPayload = {
    reqId: req.id,
    method: req.method,
    url: req.originalUrl,
    statusCode,
    userId: req.user?.uid,
  };

  if (statusCode >= 500 || !isApiError) {
    logger.error({ ...logPayload, err }, 'Unhandled error');
  } else {
    logger.warn(logPayload, err.message);
  }

  res.status(statusCode).json({
    success: false,
    message,
    requestId: req.id,
    ...(isApiError && err.details ? { details: err.details } : {}),
    ...(!env.IS_PROD && !isApiError ? { stack: err.stack } : {}),
  });
}

module.exports = { errorHandler, notFoundHandler };