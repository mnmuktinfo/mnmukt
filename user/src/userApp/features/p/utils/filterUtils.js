export const readFilters = (sp) => ({
  sizes: sp.getAll("sizes"),
  colors: sp.getAll("colors"),
  priceMin: sp.get("priceMin") ? Number(sp.get("priceMin")) : null,
  priceMax: sp.get("priceMax") ? Number(sp.get("priceMax")) : null,
  inStock: sp.get("inStock") === "true",
});

export const toggleParam = (sp, key, value) => {
  const params = new URLSearchParams(sp);
  const values = params.getAll(key);

  if (values.includes(value)) {
    const next = values.filter((v) => v !== value);
    params.delete(key);
    next.forEach((v) => params.append(key, v));
  } else {
    params.append(key, value);
  }

  return params;
};