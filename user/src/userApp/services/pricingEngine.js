export const calculatePricing = (items) => {

  let subtotal = 0;
  let originalTotalPrice = 0;

  items.forEach((item) => {
    const qty = item.quantity || 1;

    const price = Number(item.price) || 0;
    const mrp = Number(item.mrp || item.originalPrice || price);

    subtotal += price * qty;
    originalTotalPrice += mrp * qty;
  });

  let deliveryFee = 0;

  if (subtotal > 0 && subtotal < 499) deliveryFee = 50;
  else if (subtotal >= 499 && subtotal < 999) deliveryFee = 25;
  else deliveryFee = 0;

  const totalPayable = subtotal + deliveryFee;

  return {
    subtotal,
    originalTotalPrice,
    deliveryFee,
    totalPayable
  };
};