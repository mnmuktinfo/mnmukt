import { useState, useEffect } from "react";
import { dashboardService } from "../services/firebase/dashboardService";

export const useDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    usersCount: 0,
    categoriesCount: 0,
    productsCount: 0,
    ordersCount: 0,
    recentProducts: [],
    popularProducts: [],
    salesData: [],
    lowStockProducts: []
  });

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        usersCount,
        categoriesCount,
        productsCount,
        ordersCount,
        recentProducts,
        popularProducts,
        salesData,
        lowStockProducts
      ] = await Promise.all([
        dashboardService.getUsersCount(),
        dashboardService.getCategoriesCount(),
        dashboardService.getProductsCount(),
        dashboardService.getOrdersCount(),
        dashboardService.getRecentProducts(),
        dashboardService.getPopularProducts(),
        dashboardService.getSalesData(),
        dashboardService.getLowStockProducts()
      ]);

      setDashboardData({
        usersCount,
        categoriesCount,
        productsCount,
        ordersCount,
        recentProducts,
        popularProducts,
        salesData,
        lowStockProducts
      });
    } catch (err) {
      setError(err.message);
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const refreshData = () => {
    loadDashboardData();
  };

  return {
    ...dashboardData,
    loading,
    error,
    refreshData
  };
};