'use strict';

/**
 * Recursively sanitizes input by:
 * - Removing MongoDB operators ($...)
 * - Removing dots from keys
 * - Preventing prototype pollution
 */
function sanitize(value) {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sanitize);
  }

  // Leave special objects untouched
  if (
    value instanceof Date ||
    Buffer.isBuffer(value) ||
    value instanceof RegExp
  ) {
    return value;
  }

  if (typeof value === 'object') {
    const clean = {};

    for (const [key, val] of Object.entries(value)) {
      // Prevent MongoDB operator injection
      if (key.startsWith('$')) {
        continue;
      }

      // Prevent prototype pollution
      if (
        key === '__proto__' ||
        key === 'prototype' ||
        key === 'constructor'
      ) {
        continue;
      }

      // Remove dots from keys
      const safeKey = key.replace(/\./g, '');

      clean[safeKey] = sanitize(val);
    }

    return clean;
  }

  return value;
}

module.exports = function mongoSanitize(req, res, next) {
  if (req.body) {
    req.body = sanitize(req.body);
  }

  if (req.params) {
    req.params = sanitize(req.params);
  }

  // Express 5: req.query is getter-only, mutate the object instead
  if (req.query) {
    const sanitized = sanitize(req.query);

    for (const key of Object.keys(req.query)) {
      delete req.query[key];
    }

    Object.assign(req.query, sanitized);
  }

  next();
};