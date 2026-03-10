import React from "react";
import { useNavigate } from "react-router-dom";
// Standard utilitarian icons
import {
  FaUsers,
  FaDatabase,
  FaFileAlt,
  FaLayerGroup,
  FaSync,
  FaExternalLinkAlt,
  FaPlus,
  FaChartBar,
  FaExclamationCircle,
  FaCube,
} from "react-icons/fa";

import StatCard from "../components/StatCard";
import { useDashboard } from "../hooks/useDashboard";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const {
    usersCount,
    categoriesCount,
    productsCount,
    ordersCount,
    recentProducts,
    lowStockProducts,
    loading,
    error,
    refreshData,
  } = useDashboard();

  const formatCurrency = (num) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  if (error) return <ErrorProtocol error={error} refresh={refreshData} />;

  return (
    <div className="min-h-screen bg-[#f3f3f3] font-sans text-gray-900 pb-12">
      {/* 1. SIMPLE FLAT HEADER */}
      <header className="bg-white border-b border-gray-200 pt-24 pb-6 px-6">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Dashboard Overview
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Management and System Monitoring
            </p>
          </div>

          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded shadow-sm text-sm font-medium hover:bg-gray-50 transition-all active:bg-gray-100 disabled:opacity-50">
            <FaSync
              className={`${loading ? "animate-spin" : "text-gray-400"}`}
            />
            Refresh Data
          </button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 mt-8">
        {/* 2. AMAZON-STYLE STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={usersCount}
            icon={FaUsers}
            color="blue"
            loading={loading}
          />
          <StatCard
            title="Active Products"
            value={productsCount}
            icon={FaDatabase}
            color="orange"
            loading={loading}
          />
          <StatCard
            title="New Orders"
            value={ordersCount}
            icon={FaFileAlt}
            color="green"
            loading={loading}
          />
          <StatCard
            title="Categories"
            value={categoriesCount}
            icon={FaLayerGroup}
            color="gray"
            loading={loading}
          />
        </div>

        {/* 3. TWO-COLUMN DATA GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Products (Main Content) */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <FaCube className="text-gray-400" /> Recent Inventory Additions
              </h3>
              <button
                onClick={() => navigate("/products")}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline">
                See all products
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs uppercase text-gray-400 font-bold border-b border-gray-100">
                    <th className="px-6 py-3">Item View</th>
                    <th className="px-6 py-3">Details</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <TableSkeleton />
                  ) : (
                    recentProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="w-12 h-14 bg-gray-100 border border-gray-200 rounded overflow-hidden">
                            <img
                              src={product.banner}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-800 text-sm truncate max-w-[200px]">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formatCurrency(product.price)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-1 rounded ${product.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                            {product.isActive ? "ACTIVE" : "PENDING"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() =>
                              navigate(`/products/edit/${product.id}`)
                            }
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                            <FaExternalLinkAlt size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar: Alerts & Quick Actions */}
          <div className="space-y-6">
            {/* STOCK ALERTS CARD */}
            <div className="bg-white border border-gray-200 rounded shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 bg-red-50/30">
                <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                  <FaExclamationCircle className="text-red-500" /> Stock Alerts
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.slice(0, 5).map((product) => (
                    <div
                      key={product.id}
                      className="flex justify-between items-center p-3 border border-gray-100 rounded bg-gray-50/30">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate w-32">
                          {product.name}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase">
                          Restock Needed
                        </p>
                      </div>
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                        {product.stock} left
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 text-center py-4">
                    Inventory healthy.
                  </p>
                )}
              </div>
            </div>

            {/* QUICK ACCESS BENTO */}
            <div className="bg-white border border-gray-200 rounded shadow-sm p-6">
              <h3 className="font-bold text-gray-700 text-sm mb-4">
                Quick Shortcuts
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <QuickButton
                  label="New Product"
                  icon={FaPlus}
                  path="/products/create"
                  navigate={navigate}
                />
                <QuickButton
                  label="Categories"
                  icon={FaLayerGroup}
                  path="/categories"
                  navigate={navigate}
                />
                <QuickButton
                  label="Orders"
                  icon={FaFileAlt}
                  path="/orders"
                  navigate={navigate}
                />
                <QuickButton
                  label="Reports"
                  icon={FaChartBar}
                  path="/"
                  navigate={navigate}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

/* --- CLEAN HELPER COMPONENTS --- */

const QuickButton = ({ label, icon: Icon, path, navigate }) => (
  <button
    onClick={() => navigate(path)}
    className="flex flex-col items-center justify-center py-4 border border-gray-200 rounded hover:border-blue-500 hover:bg-blue-50 transition-all active:bg-blue-100 group">
    <Icon size={16} className="text-gray-400 group-hover:text-blue-600 mb-2" />
    <span className="text-[10px] font-bold text-gray-600 uppercase group-hover:text-blue-800">
      {label}
    </span>
  </button>
);

const ErrorProtocol = ({ error, refresh }) => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
    <div className="bg-white p-8 rounded shadow-lg max-w-sm w-full text-center border border-gray-200">
      <FaExclamationCircle className="text-red-500 text-4xl mx-auto mb-4" />
      <h2 className="text-xl font-bold text-gray-800 mb-2">Sync Error</h2>
      <p className="text-sm text-gray-500 mb-6">{error}</p>
      <button
        onClick={refresh}
        className="w-full py-2 bg-[#f0c14b] border border-[#a88734] rounded shadow-inner text-sm font-medium hover:bg-[#e7bb41]">
        Try refreshing data
      </button>
    </div>
  </div>
);

const TableSkeleton = () => (
  <React.Fragment>
    {[1, 2, 3, 4, 5].map((i) => (
      <tr key={i}>
        <td className="px-6 py-4">
          <div className="w-12 h-14 bg-gray-100 animate-pulse rounded" />
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-100 animate-pulse rounded w-3/4" />
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-100 animate-pulse rounded w-1/2" />
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-100 animate-pulse rounded w-8 ml-auto" />
        </td>
      </tr>
    ))}
  </React.Fragment>
);

export default AdminDashboard;
