'use strict';

const { firestore } = require('../config/firebase');
const { ApiError } = require('../utils/ApiError');

const PRODUCTS_COLLECTION = 'products';

/**
 * Fetches a single product from Firebase. This is the ONLY source of truth
 * for price — client-submitted price/subtotal/product data must never be trusted.
 */
async function getProductById(productId) {
  const doc = await firestore.collection(PRODUCTS_COLLECTION).doc(productId).get();

  if (!doc.exists) {
    throw ApiError.badRequest(`Product ${productId} does not exist`);
  }

  const data = doc.data();

  if (data.isActive === false) {
    throw ApiError.badRequest(`Product ${productId} is not currently available`);
  }

  return {
    id: doc.id,
    name: data.name,
    price: data.price, // server-trusted price
    stock: data.stock ?? null,
  };
}

/** Fetches many products in parallel; throws if any are missing/inactive. */
async function getProductsByIds(productIds) {
  const uniqueIds = [...new Set(productIds)];
  const products = await Promise.all(uniqueIds.map(getProductById));
  return new Map(products.map((p) => [p.id, p]));
}

module.exports = { getProductById, getProductsByIds };