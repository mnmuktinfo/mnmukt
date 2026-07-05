// services/shiprocket.js
const axios = require("axios");

let shiprocketToken = null;
let tokenExpiry = null;
let loginPromise = null;

const BASE_URL = "https://apiv2.shiprocket.in/v1/external";

async function login() {
  if (shiprocketToken && tokenExpiry && Date.now() < tokenExpiry) return shiprocketToken;
  if (loginPromise) return loginPromise;

  loginPromise = (async () => {
    const { data } = await axios.post(`${BASE_URL}/auth/login`, {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    });

    if (!data?.token) throw new Error("Shiprocket login returned no token");

    shiprocketToken = data.token;
    tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000;
    return shiprocketToken;
  })().finally(() => { loginPromise = null; });

  return loginPromise;
}

async function getServiceability({ pickupPincode, deliveryPincode, weight = 0.5, cod = 0 }) {
  const token = await login();

  const { data } = await axios.get(`${BASE_URL}/courier/serviceability`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { pickup_postcode: pickupPincode, delivery_postcode: deliveryPincode, weight, cod },
  });

  const couriers = data.data?.available_courier_companies || [];
  if (!couriers.length) throw new Error("No courier available");

  couriers.sort((a, b) => a.rate - b.rate);
  const courier = couriers[0];

  // etd/estimated_delivery_days can be a day-count or a date string depending on
  // account/API version — normalize both.
  let deliveryDate;
  const rawEtd = courier.estimated_delivery_days ?? courier.etd;
  const asNumber = Number(rawEtd);

  if (!Number.isNaN(asNumber) && String(rawEtd).trim() !== "") {
    deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + asNumber);
  } else if (rawEtd) {
    deliveryDate = new Date(rawEtd);
  } else {
    deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
  }

  return {
    courier: courier.courier_name,
    courierId: courier.courier_company_id,
    shippingCharge: courier.rate,
    deliveryDate: deliveryDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
  };
}

/**
 * Creates an adhoc order + shipment in Shiprocket.
 * Called once, right after your DB order is saved. Works for guest and
 * logged-in customers identically — Shiprocket doesn't care about your auth.
 */
async function createOrder(order) {
  const token = await login();

  const payload = {
    order_id: String(order.orderId),
    order_date: new Date(order.createdAt || Date.now()).toISOString().slice(0, 19).replace("T", " "),
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION, // must match a location saved in your Shiprocket dashboard
    billing_customer_name: order.shippingAddress.fullName,
    billing_last_name: "",
    billing_address: order.shippingAddress.addressLine1,
    billing_address_2: order.shippingAddress.addressLine2 || "",
    billing_city: order.shippingAddress.city,
    billing_pincode: order.shippingAddress.postalCode,
    billing_state: order.shippingAddress.state,
    billing_country: order.shippingAddress.country || "India",
    billing_email: order.customerEmail,
    billing_phone: order.shippingAddress.phone,
    shipping_is_billing: true,
    order_items: order.items.map((item) => ({
      name: item.name,
      sku: item.sku || item.productId,
      units: item.quantity,
      selling_price: item.price,
    })),
    payment_method: order.paymentMethod === "cod" ? "COD" : "Prepaid",
    sub_total: order.pricing.total,
    length: 10,
    breadth: 10,
    height: 10,
    weight: 0.5, // replace with real per-order weight if you track it
  };

  const { data } = await axios.post(`${BASE_URL}/orders/create/adhoc`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!data?.order_id) {
    throw new Error(data?.message || "Shiprocket order creation failed");
  }

  return {
    shiprocketOrderId: data.order_id,
    shipmentId: data.shipment_id,
    status: data.status,
  };
}

module.exports = { login, getServiceability, createOrder };