
export const formatPrice = (price) =>
  Number(price || 0).toLocaleString("en-IN");

export const getDiscount = (original, current) => {
  const orig = Number(original) || 0;
  const curr = Number(current) || 0;

  if (orig <= curr || orig === 0) return 0;

  return Math.round(((orig - curr) / orig) * 100);
};

export const calculateTotalMrp = (cart = []) =>
  cart.reduce((acc, item) => {
    const unitPrice = Number(item.originalPrice || item.price);
    return acc + unitPrice * item.quantity;
  }, 0);

export const getPointsEarned = (price) =>
  Math.floor(Number(price || 0) * 0.02);

export const handleImageError = (e) => {
  if (!e.target.dataset.fallback) {
    e.target.dataset.fallback = "true";
    e.target.src = "/placeholder-image.jpg";
  }
};