'use strict';

const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const shiprocketService = require('../services/shiprocket.service');

const markShipped = asyncHandler(async (req, res) => {
  const { shiprocketShipmentId, trackingNumber, courierName } = req.body;

  const order = await shiprocketService.markOrderShipped({
    orderId: req.params.orderId,
    shiprocketShipmentId,
    trackingNumber,
    courierName,
    adminUid: req.user.uid,
  });

  return sendSuccess(res, {
    message: 'Order marked as shipped',
    data: order,
  });
});

const getTracking = asyncHandler(async (req, res) => {
  const tracking = await shiprocketService.fetchTrackingInfo(req.params.orderId);

  return sendSuccess(res, {
    message: 'Tracking info fetched',
    data: tracking,
  });
});

const checkDeliveryAvailability = asyncHandler(async (req, res) => {
  const { pincode } = req.params;

  const result = await shiprocketService.checkDeliveryAvailability(pincode);

  return sendSuccess(res, {
    message: result.available
      ? 'Delivery is available.'
      : 'Delivery is not available.',
    data: result,
  });
});

module.exports = {
  markShipped,
  getTracking,
  checkDeliveryAvailability,
};