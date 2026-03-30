import React from 'react'

const countActive = (f) =>
  (f.sizes?.length ?? 0) +
  (f.colors?.length ?? 0) +
  (f.priceMin != null || f.priceMax != null ? 1 : 0) +
  (f.inStock ? 1 : 0);

export default countActive
