require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const logger = require("./utils/logger");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 5000;
const SHUTDOWN_TIMEOUT = 10000; // 10 seconds

let server;
let isShuttingDown = false;

async function startServer() {
    try {
        await connectDB();
        logger("INFO", "MongoDB connected");

        server = app.listen(PORT, () => {
            logger("INFO", `Server running on port ${PORT}`);
        });

        // Handle server errors
        server.on("error", (error) => {
            logger("ERROR", `Server error: ${error.message}`);
            if (error.code === "EADDRINUSE") {
                logger("ERROR", `Port ${PORT} is already in use`);
            }
            process.exit(1);
        });

    } catch (error) {
        logger("ERROR", `Failed to start server: ${error.message}`);
        process.exit(1);
    }
}

startServer();

/* ======================== */
/* Graceful Shutdown */
/* ======================== */

const shutdown = async (signal) => {
    // Prevent multiple shutdown attempts
    if (isShuttingDown) {
        logger("WARN", "Shutdown already in progress...");
        return;
    }

    isShuttingDown = true;
    logger("WARN", `${signal} received. Starting graceful shutdown...`);

    // Set timeout to force exit if graceful shutdown takes too long
    const shutdownTimer = setTimeout(() => {
        logger("ERROR", "Graceful shutdown timeout. Force exiting...");
        process.exit(1);
    }, SHUTDOWN_TIMEOUT);

    try {
        // Stop accepting new requests
        if (server) {
            server.close(async () => {
                logger("INFO", "HTTP server closed");

                // Close database connection
                try {
                    await mongoose.connection.close();
                    logger("INFO", "MongoDB connection closed");
                } catch (error) {
                    logger("ERROR", `Error closing MongoDB: ${error.message}`);
                }

                clearTimeout(shutdownTimer);
                process.exit(0);
            });

            // If server doesn't close within timeout, force it
            server.setTimeout(SHUTDOWN_TIMEOUT);
        } else {
            logger("WARN", "Server not started yet");
            await mongoose.connection.close();
            clearTimeout(shutdownTimer);
            process.exit(0);
        }
    } catch (error) {
        logger("ERROR", `Error during shutdown: ${error.message}`);
        clearTimeout(shutdownTimer);
        process.exit(1);
    }
};

// Graceful shutdown signals
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

/* ======================== */
/* Unhandled Errors */
/* ======================== */

process.on("uncaughtException", async (error) => {
    logger("ERROR", `Uncaught Exception: ${error.message}`);
    logger("ERROR", error.stack);

    // Attempt graceful shutdown
    await shutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", async (reason, promise) => {
    logger("ERROR", `Unhandled Rejection at ${promise}: ${reason}`);
    if (reason instanceof Error) {
        logger("ERROR", reason.stack);
    }

    // Attempt graceful shutdown
    await shutdown("UNHANDLED_REJECTION");
});

/* ======================== */
/* Process-level Error Handler */
/* ======================== */

process.on("warning", (warning) => {
    logger("WARN", `Process Warning: ${warning.name} - ${warning.message}`);
});