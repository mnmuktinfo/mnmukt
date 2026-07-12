import axiosInstance from "../../../../lib/axios";

/**
 * Creates an order on the backend to initiate Cashfree payment
 * @param {Object} data 
 * @param {string} data.orderId
 * @param {string} data.customerEmail
 * @returns {Promise<{payment_session_id: string, orderId: string}>}
 */
export const createPaymentOrder = async (data) => {
  const response = await axiosInstance.post("/payments/create-order", data);
  return response.data;
};

/**
 * Fetches the payment status from the backend
 * @param {string} orderId
 * @returns {Promise<{paymentStatus: string}>}
 */
export const getPaymentStatus = async (orderId) => {
  const response = await axiosInstance.get(`/payments/status/${orderId}`);
  return response.data;
};
