import { useState, useEffect, useCallback } from "react";
import { productService } from "../services/ProductService";

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // -----------------------------
  // GET ALL PRODUCTS
  // -----------------------------
  const getProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const productsData = await productService.getProducts();
      setProducts(productsData);

      return productsData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // -----------------------------
  // GET PRODUCT BY ID
  // -----------------------------
  const getProductById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      return await productService.getProductById(id);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // -----------------------------
  // GET PRODUCT BY SLUG
  // -----------------------------
  const getProductBySlug = useCallback(async (slug) => {
    try {
      setLoading(true);
      setError(null);

      return await productService.getProductBySlug(slug);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // -----------------------------
  // GET PRODUCTS BY CATEGORY
  // -----------------------------
  const getProductsByCategory = useCallback(async (categoryId) => {
    try {
      setLoading(true);
      setError(null);

      return await productService.getProductsByCategory(categoryId);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // -----------------------------
  // 🔥 GENERIC: GET PRODUCTS BY COLLECTION TYPES
  // -----------------------------
  const getProductsByCollections = useCallback(
    async (collectionTypes = [], limit = 8) => {
      try {
        setLoading(true);
        setError(null);

        return await productService.getProductsByCollections(
          collectionTypes,
          limit
        );
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // -----------------------------
  // SEARCH PRODUCTS
  // -----------------------------
  const searchProducts = useCallback(async (searchTerm) => {
    try {
      setLoading(true);
      setError(null);

      return await productService.searchProducts(searchTerm);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // -----------------------------
  // CREATE PRODUCT
  // -----------------------------
  const createProduct = useCallback(async (productData) => {
    try {
      setLoading(true);
      setError(null);

      const newProduct = await productService.createProduct(productData);
      setProducts((prev) => [...prev, newProduct]);

      return newProduct;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // -----------------------------
  // UPDATE PRODUCT
  // -----------------------------
  const updateProduct = useCallback(async (id, productData) => {
    try {
      setLoading(true);
      setError(null);

      await productService.updateProduct(id, productData);

      setProducts((prev) =>
        prev.map((product) =>
          product.id === id ? { ...product, ...productData } : product
        )
      );
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // -----------------------------
  // DELETE PRODUCT
  // -----------------------------
  const deleteProduct = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      await productService.deleteProduct(id);
      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // -----------------------------
  // UPDATE PRODUCT STOCK
  // -----------------------------
  const updateProductStock = useCallback(async (id, newStock) => {
    try {
      setLoading(true);
      setError(null);

      await productService.updateProductStock(id, newStock);

      setProducts((prev) =>
        prev.map((product) =>
          product.id === id ? { ...product, stock: newStock } : product
        )
      );
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // -----------------------------
  // CLEAR ERROR
  // -----------------------------
  const clearError = useCallback(() => setError(null), []);

  // Optional: load products on mount
  useEffect(() => {
    // getProducts();
  }, [getProducts]);

  return {
    // Data
    products,

    // States
    loading,
    error,

    // Queries
    getProducts,
    getProductById,
    getProductBySlug,
    getProductsByCategory,
    getProductsByCollections,
    searchProducts,

    // Mutations
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStock,

    // Utils
    clearError,
  };
};
