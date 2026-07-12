'use strict';

const { Router } = require('express');
const { requireAuth, optionalAuth } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createOrderSchema, updateOrderStatusSchema } = require('../validators/order.validator');
const orderController = require('../controllers/order.controller');

const router = Router();

// PUBLIC/SPECIFIC — before any wildcard
router.get('/shared/:shareToken', orderController.getSharedOrder);

router.post('/', optionalAuth, validate(createOrderSchema), orderController.createOrder);

// FIXED ORDER: '/mine' before '/:orderId' — was previously below it and
// getting swallowed (Express matched '/:orderId' with orderId="mine" first)
router.get('/mine', requireAuth, orderController.listMyOrders);

router.get('/', requireAuth, requireAdmin, orderController.listAllOrders);

router.get('/:orderId', optionalAuth, orderController.getOrder);
router.patch(
  '/:orderId/status',
  requireAuth,
  requireAdmin,
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

module.exports = router;