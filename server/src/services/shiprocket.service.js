'use strict';

const { getShiprocketClient } = require('../config/shiprocket');
const { Order } = require('../models/order.model');
const { ORDER_STATUS } = require('../constants/orderStatus');
const { ApiError } = require('../utils/ApiError');
const { updateOrderStatus } = require('./order.service');
const { logger } = require('../utils/logger');

/**
 * Admin manually marks an order shipped after creating the shipment directly
 * in the Shiprocket dashboard. This system never calls Shiprocket to
 * auto-create or auto-fulfill shipments — it only stores identifiers here.
 */
async function markOrderShipped({ orderId, shiprocketShipmentId, trackingNumber, courierName, adminUid }) {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');

  order.shipment.shiprocketShipmentId = shiprocketShipmentId;
  order.shipment.trackingNumber = trackingNumber;
  order.shipment.courierName = courierName || order.shipment.courierName;
  await order.save();

  return updateOrderStatus({
    orderId,
    toStatus: ORDER_STATUS.SHIPPED,
    changedBy: adminUid,
    note: `Shipped via ${courierName || 'courier'} — AWB ${trackingNumber}`,
  });
}

/** Pulls the latest tracking status + ETA from Shiprocket for a given order. */
async function fetchTrackingInfo(orderId) {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');

  if (!order.shipment.trackingNumber) {
    throw ApiError.badRequest('This order has no tracking number yet');
  }

  const client = await getShiprocketClient();

  const { data } = await client
    .get(`/courier/track/awb/${order.shipment.trackingNumber}`)
    .catch((err) => {
      logger.error({ err: err.message, orderId }, 'Shiprocket tracking fetch failed');
      throw ApiError.internal('Unable to fetch tracking info from Shiprocket');
    });

  const trackingData = data?.tracking_data;
  if (!trackingData) throw ApiError.internal('Unexpected Shiprocket tracking response');

  order.shipment.status = trackingData.shipment_status || order.shipment.status;
  order.shipment.estimatedDeliveryDate = trackingData.etd ? new Date(trackingData.etd) : order.shipment.estimatedDeliveryDate;
  order.shipment.lastFetchedAt = new Date();
  await order.save();

  return order.shipment;
}

async function checkDeliveryAvailability(pincode) {
  const client = await getShiprocketClient();

  const pickupPostcode = process.env.SHIPROCKET_PICKUP_PINCODE;

  if (!pickupPostcode) {
    throw ApiError.internal('SHIPROCKET_PICKUP_PINCODE is not configured');
  }

  try {
    const { data } = await client.get('/courier/serviceability', {
      params: {
        pickup_postcode: pickupPostcode,
        delivery_postcode: pincode,
        cod: 0,
        weight: 0.5,
      },
    });

    const couriers = data?.data?.available_courier_companies || [];

    if (!couriers.length) {
      return {
        available: false,
        pincode,
        message: 'Delivery is not available for this pincode.',
      };
    }

    couriers.sort(
      (a, b) =>
        Number(a.estimated_delivery_days) -
        Number(b.estimated_delivery_days)
    );

    const bestCourier = couriers[0];

    return {
      available: true,
      pincode,
      courier: bestCourier.courier_name,
      courierCompanyId: bestCourier.courier_company_id,
      estimatedDeliveryDays: bestCourier.estimated_delivery_days,
      etd: bestCourier.etd || null,
      codAvailable: Boolean(bestCourier.cod),
      freightCharge: bestCourier.freight_charge,
    };
  } catch (err) {
    logger.error(
      {
        err: err.response?.data || err.message,
        pincode,
      },
      'Shiprocket serviceability check failed'
    );

    throw ApiError.internal('Unable to check delivery availability');
  }
}

module.exports = {
  markOrderShipped,
  fetchTrackingInfo,
  checkDeliveryAvailability,
};