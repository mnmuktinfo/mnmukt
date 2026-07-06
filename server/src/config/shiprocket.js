'use strict';

const axios = require('axios');
const { env } = require('./env');
const { logger } = require('../utils/logger');

const client = axios.create({
  baseURL: env.SHIPROCKET_BASE_URL,
  timeout: 10000,
});

let cachedToken = null;
let tokenExpiresAt = 0; // epoch ms

async function authenticate() {
  const { data } = await axios.post(`${env.SHIPROCKET_BASE_URL}/auth/login`, {
    email: env.SHIPROCKET_EMAIL,
    password: env.SHIPROCKET_PASSWORD,
  });

  cachedToken = data.token;
  // Shiprocket tokens last ~240h; refresh a bit early to be safe.
  tokenExpiresAt = Date.now() + 1000 * 60 * 60 * 200;
  logger.info('Shiprocket token refreshed');

  return cachedToken;
}

/**
 * Returns an axios instance pre-authorized with a valid Shiprocket token.
 * Only ever used for: tracking number lookup, tracking status, ETA.
 */
async function getShiprocketClient() {
  if (!cachedToken || Date.now() >= tokenExpiresAt) {
    await authenticate();
  }

  client.defaults.headers.common.Authorization = `Bearer ${cachedToken}`;
  return client;
}

module.exports = { getShiprocketClient };