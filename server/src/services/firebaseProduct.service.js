'use strict';

const { firestore } = require('../config/firebase');
const { ApiError } = require('../utils/ApiError');

const PRODUCTS_COLLECTION = 'products';

async function getProductById(productId) {
  const doc = await firestore.collection(PRODUCTS_COLLECTION).doc(productId).get();

  if (!doc.exists) {
    throw ApiError.badRequest(`Product ${productId} does not exist`);
  }

  const data = doc.data();

  if (data.isActive === false) {
    throw ApiError.badRequest(`Product ${productId} is not currently available`);
  }

  // 👈 FIXED: a missing/invalid price used to fall through to 0 downstream
  // (Number(undefined || 0) === 0), silently pricing an item free instead
  // of blocking checkout on bad product data.
  if (typeof data.price !== 'number' || !Number.isFinite(data.price) || data.price <= 0) {
    throw ApiError.badRequest(`Product ${productId} has an invalid price configured`);
  }

  return {
    id: doc.id,
    name: data.name,
    price: data.price,
    stock: data.stock ?? null,
    image: data.images?.[0] || null,
  };
}

async function getProductsByIds(productIds) {
  const uniqueIds = [...new Set(productIds)];
  const products = await Promise.all(uniqueIds.map(getProductById));
  return new Map(products.map((p) => [p.id, p]));
}

module.exports = { getProductById, getProductsByIds };