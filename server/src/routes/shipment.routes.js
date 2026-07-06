'use strict';

const { Router } = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');
const { validate } = require('../middleware/validate.middleware');
const { markShippedSchema } = require('../validators/shipment.validator');
const shipmentController = require('../controllers/shipment.controller');

const router = Router();

// Mark an order as shipped (Admin)
router.patch(
  '/:orderId/ship',
  requireAuth,
  requireAdmin,
  validate(markShippedSchema),
  shipmentController.markShipped
);

// Get tracking details
router.get(
  '/:orderId/tracking',
  requireAuth,
  shipmentController.getTracking
);

// Check delivery availability by PIN code
router.get(
  '/check-delivery/:pincode',
  shipmentController.checkDeliveryAvailability
);

module.exports = router;