require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");

const logger = require("./utils/logger");

const requestIdMiddleware = require("./middleware/requestIdMiddleware");
const { apiLimiter } = require("./middleware/rateLimiter");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const webhookRoutes = require("./routes/webhooks.routes");
const routes = require("./routes/index.routes");

const app = express();

/* ------------------------- */
/* Express Settings */
/* ------------------------- */

app.set("trust proxy", 1);
app.disable("x-powered-by");

/* ------------------------- */
/* Security (Lightweight) */
/* ------------------------- */

// Minimal helmet config for performance
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: false,
        hsts: { maxAge: 31536000 }, // One year
    })
);

app.use(compression({ level: 6, threshold: 1024 })); // Only compress >1KB
app.use(cookieParser());

/* ------------------------- */
/* CORS */
/* ------------------------- */

const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.ADMIN_URL,
].filter(Boolean);

app.use(
    cors({
        origin(origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            const error = new Error("Not allowed by CORS");
            error.statusCode = 403;
            callback(error);
        },
        credentials: true,
    })
);

/* ------------------------- */
/* Request ID */
/* ------------------------- */

app.use(requestIdMiddleware);

/* ------------------------- */
/* Conditional Logger (Dev Only) */
/* ------------------------- */

if (process.env.NODE_ENV !== "production") {
    const morgan = require("morgan");
    morgan.token("id", (req) => req.id);
    app.use(
        morgan(":id :remote-addr :method :url :status :response-time ms", {
            stream: {
                write: (message) => logger("INFO", message.trim()),
            },
        })
    );
}

/* ------------------------- */
/* Rate Limiting */
/* ------------------------- */

app.use(apiLimiter);

/* ------------------------- */
/* Webhooks */
/* ------------------------- */

app.use(
    "/api/v1/webhooks",
    express.raw({ type: "application/json" }),
    webhookRoutes
);

/* ------------------------- */
/* Body Parsers */
/* ------------------------- */

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: false, limit: "2mb" }));

/* ------------------------- */
/* Health */
/* ------------------------- */

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server Running",
        environment: process.env.NODE_ENV,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

/* ------------------------- */
/* API Routes */
/* ------------------------- */

app.use("/api/v1", routes);

/* ------------------------- */
/* 404 */
/* ------------------------- */

app.use(notFound);

/* ------------------------- */
/* Error Handler */
/* ------------------------- */

app.use(errorHandler);

module.exports = app;