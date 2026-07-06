'use strict';

const { firebaseAuth } = require('../config/firebase');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const { ROLES } = require('../constants/roles');

function extractBearerToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
}

function decodeToUser(decodedToken) {
  return {
    uid: decodedToken.uid,
    email: decodedToken.email || null,
    role: decodedToken.role === 'admin' || decodedToken.admin === true ? ROLES.ADMIN : ROLES.USER,
  };
}

/** Requires a valid Firebase ID token. Rejects guests. */
const requireAuth = asyncHandler(async (req, res, next) => {
  const token = extractBearerToken(req);
  if (!token) throw ApiError.unauthorized('Missing or invalid Authorization header');

  const decoded = await firebaseAuth.verifyIdToken(token).catch(() => {
    throw ApiError.unauthorized('Invalid or expired token');
  });

  req.user = decodeToUser(decoded);
  req.isGuest = false;
  next();
});

/**
 * Supports both authenticated users and guests. If a token is present it must
 * be valid; if absent, the request proceeds as a guest and the controller/
 * validator is responsible for requiring guest email + phone instead.
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = extractBearerToken(req);

  if (!token) {
    req.user = null;
    req.isGuest = true;
    return next();
  }

  const decoded = await firebaseAuth.verifyIdToken(token).catch(() => {
    throw ApiError.unauthorized('Invalid or expired token');
  });

  req.user = decodeToUser(decoded);
  req.isGuest = false;
  next();
});

module.exports = { requireAuth, optionalAuth };