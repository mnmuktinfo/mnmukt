'use strict';

const { z } = require('zod');

const markShippedSchema = z.object({
  shiprocketShipmentId: z.string().min(1),
  trackingNumber: z.string().min(1),
  courierName: z.string().optional(),
});

module.exports = { markShippedSchema };