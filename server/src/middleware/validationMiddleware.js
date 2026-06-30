const logger = require("../utils/logger");




const createValidator = (schema, source, label) => {
  return (req, res, next) => {
    const start = Date.now();

    try {
      // ✅ ZOD ONLY
      const result = schema.safeParse(req[source]);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
          code: issue.code,
        }));

        logger("WARN", `${label} validation failed`, {
          requestId: req.id,
          method: req.method,
          route: req.originalUrl,
          ip: req.ip,
          validationErrors: errors,
          payload: req[source],
          duration: `${Date.now() - start}ms`,
        });

        return res.status(422).json({
          success: false,
          message: `${label} validation failed.`,
          errors,
        });
      }

      // ✅ replace request data with clean Zod output
      req[source] = result.data;

      return next();
    } catch (error) {
      logger("ERROR", error, {
        requestId: req.id,
        route: req.originalUrl,
      });

      return res.status(500).json({
        success: false,
        message: "Validation middleware failed.",
      });
    }
  };
};

/* ==========================================================
   Validators
========================================================== */

const validateBody = (schema) =>
  createValidator(schema, "body", "Request body");

const validateParams = (schema) =>
  createValidator(schema, "params", "URL parameter");

const validateQuery = (schema) =>
  createValidator(schema, "query", "Query parameter");

/* ==========================================================
   Exports
========================================================== */

module.exports = {
  validateBody,
  validateParams,
  validateQuery,
};