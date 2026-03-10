import { useState, useEffect } from "react";
import { productService } from "../services/firebase/productService";
import { categoryService } from "../services/firebase/categoryService";

export const useProducts = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await categoryService.getCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    
    loadCategories();
  }, []);

  const createProduct = async (productData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await productService.createProduct(productData);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const updateProduct = async (id, productData) => {
    setLoading(true);
    setError(null);
    
    try {
      await productService.updateProduct(id, productData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const getProduct = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const product = await productService.getProduct(id);
      setLoading(false);
      return product;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const deleteProduct = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      await productService.deleteProduct(id);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const getProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const products = await productService.getProducts();
      setLoading(false);
      return products;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return {
    createProduct,
    updateProduct,
    getProduct,
    deleteProduct,
    getProducts,
    categories,
    loading,
    error,
    clearError: () => setError(null)
  };
};