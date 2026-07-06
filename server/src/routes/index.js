'use strict';

const { Router } = require('express');

const authRoutes = require('./auth.routes');
const orderRoutes = require('./order.routes');
const paymentRoutes = require('./payment.routes');
const webhookRoutes = require('./webhook.routes');
const shipmentRoutes = require('./shipment.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/shipments', shipmentRoutes);

module.exports = router;