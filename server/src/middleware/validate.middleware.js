'use strict';

const { ApiError } = require('../utils/ApiError');

/**
 * Validates req[source] against a Zod schema and replaces it with the
 * parsed (and therefore coerced/stripped) value.
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.flatten().fieldErrors;
      return next(ApiError.badRequest('Validation failed', details));
    }

    req[source] = result.data;
    next();
  };
}

module.exports = { validate };