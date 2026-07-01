const { Resend } = require('resend');
const logger = require('../utils/logger');

const resend = new Resend(process.env.RESEND_API_KEY || 're_7g8xkD66_LgwotUQAH9MNEQpS6T1U4tgT'); // Fallback during migration

const sendOrderConfirmationEmail = async (orderData) => {
  try {
    const { orderId, customer, items, pricing } = orderData;
    const toEmail = customer?.email;

    if (!toEmail) {
      logger("WARN", `Cannot send email: No customer email found for order ${orderId}`);
      return;
    }

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong><br/>
          <span style="color: #666; font-size: 12px;">Qty: ${item.quantity}</span>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ₹${item.totalPrice}
        </td>
      </tr>
    `).join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #da127d; text-align: center;">Order Confirmed!</h2>
        <p>Hi ${customer.name || 'there'},</p>
        <p>Thank you for your purchase. We have received your order <strong>#${orderId}</strong> and are getting it ready for shipment.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f9f9f9;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td style="padding: 10px; text-align: right; font-weight: bold;">Subtotal:</td>
              <td style="padding: 10px; text-align: right;">₹${pricing.subtotal}</td>
            </tr>
            <tr>
              <td style="padding: 10px; text-align: right; font-weight: bold;">Shipping:</td>
              <td style="padding: 10px; text-align: right;">₹${pricing.shippingCharge}</td>
            </tr>
            <tr style="font-size: 18px;">
              <td style="padding: 10px; text-align: right; font-weight: bold; color: #da127d;">Total Paid:</td>
              <td style="padding: 10px; text-align: right; font-weight: bold; color: #da127d;">₹${pricing.total}</td>
            </tr>
          </tfoot>
        </table>
        
        <p style="margin-top: 30px; text-align: center; font-size: 14px; color: #888;">
          You can track your order status on our website.
        </p>
      </div>
    `;

    const response = await resend.emails.send({
      from: 'store@mnmukt.com', // Update this to verified domain when available
      to: toEmail,
      subject: `Order Confirmation - #${orderId}`,
      html: htmlContent
    });

    logger("INFO", `Order confirmation email sent to ${toEmail} for order ${orderId}`, response);
    return response;

  } catch (error) {
    logger("ERROR", `Failed to send confirmation email: ${error.message}`);
  }
};

module.exports = {
  sendOrderConfirmationEmail
};