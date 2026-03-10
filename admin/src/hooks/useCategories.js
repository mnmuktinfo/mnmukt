import { useState } from "react";
import { categoryService } from "../services/firebase/categoryService";

export const useCategories = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createCategory = async (categoryData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await categoryService.createCategory(categoryData);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return {
    createCategory,
    loading,
    error,
    clearError: () => setError(null)
  };
};