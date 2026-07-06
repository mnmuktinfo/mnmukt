'use strict';

const { Router } = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');
const { validate } = require('../middleware/validate.middleware');
const { setUserRoleSchema } = require('../validators/auth.validator');
const authController = require('../controllers/auth.controller');

const router = Router();

router.use(authLimiter);

router.get('/me', requireAuth, authController.getMe);
router.post('/set-role', requireAuth, requireAdmin, validate(setUserRoleSchema), authController.setUserRole);

module.exports = router;