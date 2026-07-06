'use strict';

const { Router } = require('express');
const { requireAuth, optionalAuth } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createOrderSchema, updateOrderStatusSchema } = require('../validators/order.validator');
const orderController = require('../controllers/order.controller');

const router = Router();

//  PUBLIC/SPECIFIC ROUTES (Must go first to avoid being swallowed by wildcards)
router.get('/shared/:shareToken', orderController.getSharedOrder);

//  OPTIONAL AUTH ROUTES (Guests or Logged-in users)
router.post('/', optionalAuth, validate(createOrderSchema), orderController.createOrder);
router.get('/:orderId', optionalAuth, orderController.getOrder);

//  STRICT AUTH ROUTES (Logged-in users only)
router.get('/mine', requireAuth, orderController.listMyOrders); // NOTE: /mine could also be swallowed by /:orderId if it was below it! Good job putting it above in your original code.

//  ADMIN ROUTES
router.get('/', requireAuth, requireAdmin, orderController.listAllOrders);
router.patch(
  '/:orderId/status',
  requireAuth,
  requireAdmin,
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

module.exports = router;