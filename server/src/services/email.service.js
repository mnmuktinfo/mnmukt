'use strict';

const { resend } = require('../config/resend');
const { firebaseAuth } = require('../config/firebase');
const { env } = require('../config/env');
const { logger } = require('../utils/logger');

/** Escapes HTML special characters to prevent injection into the email template. */
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]));
}

/** Formats a currency amount consistently, using the order's actual currency. */
function formatAmount(amount, currency) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'INR',
      minimumFractionDigits: 2,
    }).format(Number(amount) || 0);
  } catch {
    // Unknown/invalid ISO currency code — fall back to a plain number with the code.
    return `${(Number(amount) || 0).toFixed(2)} ${currency || 'INR'}`;
  }
}

async function resolveRecipientEmail(order) {
  if (order.isGuest) return order.guestInfo?.email || null;

  // Logged-in orders only store the Firebase UID — email is looked up on send.
  try {
    const userRecord = await firebaseAuth.getUser(order.userUid);
    return userRecord?.email || null;
  } catch (err) {
    logger.warn({ err, orderId: order._id, userUid: order.userUid }, 'Failed to resolve recipient email from Firebase');
    return null;
  }
}

/**
 * Fire-and-forget: callers must never `await` this inline in a path that
 * shouldn't be blocked by email delivery. Failures are logged, not thrown.
 */
async function sendOrderConfirmationEmail(order) {
  const toEmail = await resolveRecipientEmail(order);
  if (!toEmail) {
    logger.warn({ orderId: order._id }, 'No recipient email available for order confirmation');
    return;
  }

  try {
    await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: toEmail,
      subject: `Order Confirmed — #${order._id}`,
      html: buildConfirmationHtml(order),
      text: buildConfirmationText(order),
    });
    logger.info({ orderId: order._id }, 'Order confirmation email sent');
  } catch (err) {
    logger.error({ err, orderId: order._id }, 'Resend email delivery failed');
  }
}

function buildConfirmationHtml(order) {
  const currency = order.pricing?.currency || 'INR';
  const items = order.items || [];

  const itemsRows = items
    .map(
      (i) =>
        `<tr><td>${escapeHtml(i.name)}</td><td>${escapeHtml(i.quantity)}</td><td>${formatAmount(i.subtotal, currency)}</td></tr>`
    )
    .join('');

  return `
    <h2>Thank you for your order!</h2>
    <p>Order ID: ${escapeHtml(order._id)}</p>
    <table>
      <thead><tr><th>Item</th><th>Qty</th><th>Subtotal</th></tr></thead>
      <tbody>${itemsRows}</tbody>
    </table>
    <p><strong>Total: ${formatAmount(order.pricing?.totalAmount, currency)}</strong></p>
  `;
}

function buildConfirmationText(order) {
  const currency = order.pricing?.currency || 'INR';
  const items = order.items || [];

  const lines = items.map(
    (i) => `- ${i.name} x${i.quantity}: ${formatAmount(i.subtotal, currency)}`
  );

  return [
    'Thank you for your order!',
    `Order ID: ${order._id}`,
    '',
    ...lines,
    '',
    `Total: ${formatAmount(order.pricing?.totalAmount, currency)}`,
  ].join('\n');
}

module.exports = { sendOrderConfirmationEmail };