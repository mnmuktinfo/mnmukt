'use strict';

const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const userService = require('../services/user.service');

const getMe = asyncHandler(async (req, res) => {
  const profile = await userService.getUserProfile(req.user.uid);
  return sendSuccess(res, { message: 'Profile fetched', data: profile });
});

const setUserRole = asyncHandler(async (req, res) => {
  const { targetUid, role } = req.body;
  const result = await userService.setUserRole(targetUid, role);
  return sendSuccess(res, { message: 'Role updated', data: result });
});

module.exports = { getMe, setUserRole };