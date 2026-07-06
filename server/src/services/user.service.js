'use strict';

const { firebaseAuth } = require('../config/firebase');
const { ApiError } = require('../utils/ApiError');
const { ROLES } = require('../constants/roles');

async function setUserRole(targetUid, role) {
  if (!Object.values(ROLES).includes(role)) {
    throw ApiError.badRequest('Invalid role');
  }
  await firebaseAuth.setCustomUserClaims(targetUid, { role });
  return { uid: targetUid, role };
}

async function getUserProfile(uid) {
  const userRecord = await firebaseAuth.getUser(uid).catch(() => {
    throw ApiError.notFound('User not found');
  });
  return {
    uid: userRecord.uid,
    email: userRecord.email,
    role: userRecord.customClaims?.role || ROLES.USER,
  };
}

module.exports = { setUserRole, getUserProfile };