
export const redirectToWhatsApp = ({
  phone=8392856993,
  orderId,
  amount,
  customerName = "",
  extraMessage = "",
}) => {
  if (!phone || !orderId || !amount) return;

  const sanitizedPhone = String(phone).replace(/\D/g, ""); // Only digits

  const message = encodeURIComponent(
    `Hello${customerName ? `, ${customerName}` : ""}!\n\n` +
      `I placed an order.\nOrder ID: ${orderId}\nAmount: ₹${amount}\n\n` +
      `${extraMessage ? extraMessage + "\n\n" : ""}Please confirm my order.`
  );

  const url = `https://wa.me/${sanitizedPhone}?text=${message}`;

  window.open(url, "_blank");
};