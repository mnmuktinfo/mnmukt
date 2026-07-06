'use strict';

/**
 * Wraps an async route/controller so rejected promises are forwarded to
 * the centralized error handler instead of crashing the process.
 */
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { asyncHandler };