const logger = require("../utils/logger");

module.exports = (err, req, res, next) => {

    if (res.headersSent) {
        return next(err);
    }

    const statusCode = err.statusCode || err.status || 500;

    logger("ERROR", {
        requestId: req.id,
        method: req.method,
        url: req.originalUrl,
        statusCode,
        message: err.message,
        stack: err.stack,
    });

    res.status(statusCode).json({
        success: false,
        message:
            process.env.NODE_ENV === "production" &&
            statusCode >= 500
                ? "Internal Server Error"
                : err.message,

        requestId: req.id,
        timestamp: new Date().toISOString(),

        ...(process.env.NODE_ENV === "development" && {
            stack: err.stack,
        }),
    });
};