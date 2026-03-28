// ── TaruVeda Product Categories ──────────────────────────────────
// Add / remove categories here as your product range grows.

export const TARUVEDA_CATEGORIES = [
  { value: "All",       label: "Shop All"  },
  { value: "Hair Care", label: "Hair Care" },
  { value: "Skin Care", label: "Skin Care" },
  { value: "Body Care", label: "Body Care" },
  { value: "Combos",    label: "Combo"     },
];

// Quick lookup: just the value strings (useful for filters / validation)
export const TARUVEDA_CATEGORY_VALUES = TARUVEDA_CATEGORIES.map((c) => c.value);

// Default selected category
export const DEFAULT_CATEGORY = "All";