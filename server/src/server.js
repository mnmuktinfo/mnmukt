'use strict';

const { app } = require('./app');
const { env } = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const { logger } = require('./utils/logger');

let server;

async function start() {
  await connectDB();

  server = app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}

async function shutdown(signal) {
  logger.info(`${signal} received — shutting down gracefully`);

  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }

    await disconnectDB();

    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'Error during shutdown');
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled promise rejection');
});

process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught exception — exiting');
  process.exit(1);
});

start().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});