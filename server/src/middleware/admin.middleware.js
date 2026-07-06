'use strict';

const { ApiError } = require('../utils/ApiError');
const { ROLES } = require('../constants/roles');

/** Must run after requireAuth. */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== ROLES.ADMIN) {
    return next(ApiError.forbidden('Admin access required'));
  }
  next();
}

module.exports = { requireAdmin };