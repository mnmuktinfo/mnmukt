/* ─────────────────────────────────────
   CONSTANTS & THEMING
───────────────────────────────────── */
export const BRAND_PINK = "#da127d";

export const COLLECTION_LABELS = {
  all: "All Products",
  "new-arrivals": "New Arrivals",
  bestsellers: "Bestsellers",
  dresses: "Dresses",
  tops: "Tops",
  shirts: "Shirts",
  "co-ord-sets": "Co-ord Sets",
  jackets: "Jackets",
  bottoms: "Bottoms",
  "rang-tie-dye": "Rang (Tie-Dye)",
  artsy: "Artsy",
  basics: "Basics",
  "on-sale": "On Sale",
};

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "Free Size"];

export const COLORS = [
  { name: "Beige", hex: "#D4B896" },
  { name: "Black", hex: "#1C1C1C" },
  { name: "Blue", hex: "#4A90C4" },
  { name: "Brown", hex: "#8B5E3C" },
  { name: "Gray", hex: "#9E9E9E" },
  { name: "Green", hex: "#5A9E6F" },
  { name: "Multicolor", hex: null },
  { name: "Orange", hex: "#E87040" },
  { name: "Pink", hex: "#E8789A" },
  { name: "Purple", hex: "#9B59B6" },
  { name: "Red", hex: "#C0392B" },
  { name: "White", hex: "#F0F0F0" },
  { name: "Yellow", hex: "#F1C40F" },
];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Alphabetically, A–Z" },
  { value: "name_desc", label: "Alphabetically, Z–A" },
];

export const PRICE_PRESETS = [
  { label: "Under ₹500", min: 0, max: 499 },
  { label: "₹500 – ₹1,000", min: 500, max: 1000 },
  { label: "₹1,000 – ₹2,000", min: 1000, max: 2000 },
  { label: "₹2,000 – ₹5,000", min: 2000, max: 5000 },
  { label: "Above ₹5,000", min: 5001, max: null },
];