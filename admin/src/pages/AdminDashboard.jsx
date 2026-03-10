// import React from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   FaUsers,
//   FaDatabase,
//   FaFileAlt,
//   FaLayerGroup,
//   FaSync,
//   FaExternalLinkAlt,
//   FaPlus,
//   FaChartBar,
//   FaExclamationCircle,
//   FaCube,
//   FaAngleRight,
// } from "react-icons/fa";

// import StatCard from "../components/StatCard";
// import { useDashboard } from "../hooks/useDashboard";

// const AdminDashboard = () => {
//   const navigate = useNavigate();
//   const {
//     usersCount,
//     categoriesCount,
//     productsCount,
//     ordersCount,
//     recentProducts,
//     lowStockProducts,
//     loading,
//     error,
//     refreshData,
//   } = useDashboard();

//   const formatCurrency = (num) => {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//       maximumFractionDigits: 0,
//     }).format(num);
//   };

//   if (error) return <ErrorProtocol error={error} refresh={refreshData} />;

//   return (
//     <div className="min-h-screen bg-[#F1F3F6] font-sans text-[#212121] pb-12 antialiased">
//       {/* 1. SIMPLE FLAT HEADER */}
//       <header className="bg-white border-b border-gray-200 pt-20 pb-5 px-4 md:px-8 shadow-sm">
//         <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
//           <div>
//             <h1 className="text-2xl font-semibold text-gray-900">
//               Dashboard Overview
//             </h1>
//             <p className="text-sm text-gray-500 mt-1">
//               Monitor your store's performance and recent activity.
//             </p>
//           </div>

//           <button
//             onClick={refreshData}
//             disabled={loading}
//             className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-sm shadow-sm text-sm font-medium text-gray-700 hover:text-[#2874F0] hover:border-[#2874F0] hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-50">
//             <FaSync
//               className={`${loading ? "animate-spin text-[#2874F0]" : ""}`}
//             />
//             Refresh Data
//           </button>
//         </div>
//       </header>

//       <main className="max-w-[1400px] mx-auto px-4 md:px-8 mt-6">
//         {/* 2. STAT CARDS */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
//           <StatCard
//             title="Total Users"
//             value={usersCount}
//             icon={FaUsers}
//             color="blue"
//             loading={loading}
//           />
//           <StatCard
//             title="Active Products"
//             value={productsCount}
//             icon={FaDatabase}
//             color="orange"
//             loading={loading}
//           />
//           <StatCard
//             title="New Orders"
//             value={ordersCount}
//             icon={FaFileAlt}
//             color="green"
//             loading={loading}
//           />
//           <StatCard
//             title="Categories"
//             value={categoriesCount}
//             icon={FaLayerGroup}
//             color="gray"
//             loading={loading}
//           />
//         </div>

//         {/* 3. TWO-COLUMN DATA GRID */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Main Content: Recent Products */}
//           <div className="lg:col-span-2 bg-white border border-gray-200 rounded-sm shadow-sm flex flex-col">
//             <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
//               <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-base">
//                 <FaCube className="text-gray-400" /> Recently Added Products
//               </h3>
//               <button
//                 onClick={() => navigate("/products")}
//                 className="text-sm text-[#2874F0] font-medium hover:underline flex items-center gap-1">
//                 View All <FaAngleRight />
//               </button>
//             </div>

//             <div className="overflow-x-auto">
//               <table className="w-full text-left border-collapse min-w-[500px]">
//                 <thead>
//                   <tr className="bg-[#fcfcfc] text-xs text-gray-500 font-medium border-b border-gray-200">
//                     <th className="px-6 py-3 font-medium w-[80px]">Product</th>
//                     <th className="px-6 py-3 font-medium">Details</th>
//                     <th className="px-6 py-3 font-medium w-[120px]">Status</th>
//                     <th className="px-6 py-3 font-medium text-right w-[80px]">
//                       Action
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100 text-sm">
//                   {loading ? (
//                     <TableSkeleton />
//                   ) : recentProducts?.length > 0 ? (
//                     recentProducts.map((product) => (
//                       <tr
//                         key={product.id}
//                         className="hover:bg-blue-50/50 transition-colors group">
//                         <td className="px-6 py-3">
//                           <div className="w-12 h-12 bg-white border border-gray-200 rounded-sm overflow-hidden flex items-center justify-center p-1">
//                             <img
//                               src={
//                                 product.banner ||
//                                 product.images?.[0] ||
//                                 product.image
//                               }
//                               className="w-full h-full object-contain"
//                               alt={product.name}
//                             />
//                           </div>
//                         </td>
//                         <td className="px-6 py-3">
//                           <p
//                             className="font-medium text-gray-900 truncate max-w-[250px]"
//                             title={product.name}>
//                             {product.name}
//                           </p>
//                           <p className="text-sm font-semibold text-gray-700 mt-0.5">
//                             {formatCurrency(product.price)}
//                           </p>
//                         </td>
//                         <td className="px-6 py-3">
//                           <span
//                             className={`text-xs font-medium px-2.5 py-1 rounded-sm ${
//                               product.isActive !== false
//                                 ? "bg-green-100 text-green-700"
//                                 : "bg-gray-100 text-gray-600"
//                             }`}>
//                             {product.isActive !== false ? "Active" : "Draft"}
//                           </span>
//                         </td>
//                         <td className="px-6 py-3 text-right">
//                           <button
//                             onClick={() =>
//                               navigate(`/admin/products/edit/${product.id}`)
//                             }
//                             className="p-2 text-gray-400 hover:text-[#2874F0] transition-colors rounded hover:bg-blue-50"
//                             title="Edit Product">
//                             <FaExternalLinkAlt size={14} />
//                           </button>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td
//                         colSpan="4"
//                         className="px-6 py-8 text-center text-sm text-gray-500">
//                         No recent products found.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* Sidebar: Alerts & Quick Actions */}
//           <div className="space-y-6">
//             {/* STOCK ALERTS CARD */}
//             <div className="bg-white border border-gray-200 rounded-sm shadow-sm">
//               <div className="px-5 py-4 border-b border-gray-200 bg-[#FFF9E6]">
//                 <h3 className="font-semibold text-[#856404] text-sm flex items-center gap-2">
//                   <FaExclamationCircle className="text-[#856404]" /> Low Stock
//                   Alerts
//                 </h3>
//               </div>
//               <div className="p-4">
//                 {lowStockProducts?.length > 0 ? (
//                   <div className="space-y-3">
//                     {lowStockProducts.slice(0, 5).map((product) => (
//                       <div
//                         key={product.id}
//                         className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-0 last:pb-0">
//                         <div className="min-w-0 pr-4">
//                           <p
//                             className="text-sm font-medium text-gray-800 truncate w-40"
//                             title={product.name}>
//                             {product.name}
//                           </p>
//                           <p className="text-xs text-red-500 mt-0.5 font-medium">
//                             Please restock soon
//                           </p>
//                         </div>
//                         <span className="text-xs font-semibold text-red-700 bg-red-50 border border-red-100 px-2 py-1 rounded-sm whitespace-nowrap">
//                           {product.stock} left
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="text-center py-6 text-sm text-gray-500">
//                     <p className="text-green-600 font-medium mb-1">
//                       Inventory is healthy.
//                     </p>
//                     <p className="text-xs">No low stock alerts right now.</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* QUICK ACCESS BENTO */}
//             <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-5">
//               <h3 className="font-semibold text-gray-800 text-sm mb-4">
//                 Quick Actions
//               </h3>
//               <div className="grid grid-cols-2 gap-3">
//                 <QuickButton
//                   label="Add Product"
//                   icon={FaPlus}
//                   path="/admin/products/new"
//                   navigate={navigate}
//                 />
//                 <QuickButton
//                   label="Categories"
//                   icon={FaLayerGroup}
//                   path="/admin/categories"
//                   navigate={navigate}
//                 />
//                 <QuickButton
//                   label="View Orders"
//                   icon={FaFileAlt}
//                   path="/admin/orders"
//                   navigate={navigate}
//                 />
//                 <QuickButton
//                   label="Reports"
//                   icon={FaChartBar}
//                   path="/"
//                   navigate={navigate}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// /* --- HELPER COMPONENTS --- */

// const QuickButton = ({ label, icon: Icon, path, navigate }) => (
//   <button
//     onClick={() => navigate(path)}
//     className="flex flex-col items-center justify-center py-4 border border-gray-200 rounded-sm hover:border-[#2874F0] hover:bg-blue-50 transition-all active:scale-95 group bg-gray-50/50">
//     <Icon
//       size={18}
//       className="text-gray-400 group-hover:text-[#2874F0] mb-2 transition-colors"
//     />
//     <span className="text-xs font-medium text-gray-700 group-hover:text-[#2874F0] transition-colors">
//       {label}
//     </span>
//   </button>
// );

// const ErrorProtocol = ({ error, refresh }) => (
//   <div className="min-h-screen bg-[#F1F3F6] flex items-center justify-center p-6">
//     <div className="bg-white p-8 rounded-sm shadow-sm max-w-sm w-full text-center border border-gray-200">
//       <FaExclamationCircle className="text-red-500 text-4xl mx-auto mb-4" />
//       <h2 className="text-lg font-semibold text-gray-900 mb-2">
//         Connection Error
//       </h2>
//       <p className="text-sm text-gray-600 mb-6">{error}</p>
//       <button
//         onClick={refresh}
//         className="w-full py-2.5 bg-[#2874F0] text-white rounded-sm text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm">
//         Try refreshing data
//       </button>
//     </div>
//   </div>
// );

// const TableSkeleton = () => (
//   <React.Fragment>
//     {[1, 2, 3, 4, 5].map((i) => (
//       <tr
//         key={i}
//         className="animate-pulse border-b border-gray-100 last:border-0">
//         <td className="px-6 py-3">
//           <div className="w-12 h-12 bg-gray-200 rounded-sm" />
//         </td>
//         <td className="px-6 py-3">
//           <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
//           <div className="h-3 bg-gray-200 rounded w-1/4" />
//         </td>
//         <td className="px-6 py-3">
//           <div className="h-5 bg-gray-200 rounded-sm w-16" />
//         </td>
//         <td className="px-6 py-3">
//           <div className="h-6 bg-gray-200 rounded w-6 ml-auto" />
//         </td>
//       </tr>
//     ))}
//   </React.Fragment>
// );

// export default AdminDashboard;
