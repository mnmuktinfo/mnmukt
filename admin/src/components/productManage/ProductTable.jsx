import React from "react";
import {
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Image as ImageIcon,
  PackageOpen,
  Loader2,
} from "lucide-react";
import StockBadge from "./StockBadge";
import StatusPill from "./StatusPill";

const ProductTable = ({
  products,
  loading,
  hasMore,
  loadingMore,
  handleToggleVisibility,
  setDeleteTarget,
  navigate,
  getDiscount,
  formatPKR,
}) => {
  // --- Loading Skeleton ---
  if (loading && products.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-sm shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 border-b border-gray-100 animate-pulse">
            <div className="w-14 h-14 bg-gray-200 rounded-sm shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 w-1/3 rounded"></div>
              <div className="h-3 bg-gray-200 w-1/4 rounded"></div>
            </div>
            <div className="hidden lg:block h-6 bg-gray-200 w-24 rounded"></div>
            <div className="hidden lg:block h-6 bg-gray-200 w-20 rounded-full"></div>
            <div className="hidden lg:block h-8 bg-gray-200 w-24 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  // --- Empty State ---
  if (products.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-[#f1f3f6] rounded-full flex items-center justify-center mb-4">
          <PackageOpen size={32} className="text-[#878787]" />
        </div>
        <h3 className="text-[16px] font-medium text-[#212121] mb-1">
          No Products Found
        </h3>
        <p className="text-[13px] text-[#878787] max-w-sm">
          We couldn't find any products matching your current filters. Try
          adjusting your search criteria or add a new product.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-sm shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] overflow-hidden">
      {/* Table Header (Desktop Only) */}
      <div className="hidden lg:grid grid-cols-[60px_1fr_150px_120px_110px_80px_120px] gap-4 px-6 py-3.5 bg-[#f9fafb] border-b border-gray-200 text-[12px] font-semibold text-[#878787] uppercase tracking-wider items-center">
        <div>Image</div>
        <div>Product Details</div>
        <div>Price</div>
        <div>Inventory</div>
        <div>Status</div>
        <div className="text-center">Visibility</div>
        <div className="text-right pr-2">Actions</div>
      </div>

      {/* Product Rows */}
      <div className="divide-y divide-gray-100">
        {products.map((product) => {
          const disc = getDiscount(product.price, product.originalPrice);

          return (
            <div
              key={product.id}
              className="flex flex-col lg:grid lg:grid-cols-[60px_1fr_150px_120px_110px_80px_120px] gap-4 p-4 lg:px-6 lg:py-4 items-center hover:bg-[#f8fafd] transition-colors group">
              {/* Image & Mobile Header Wrapper */}
              <div className="flex items-center gap-4 w-full lg:w-auto lg:contents">
                {/* Image */}
                <div className="w-16 h-16 lg:w-14 lg:h-14 rounded-sm overflow-hidden border border-gray-200 bg-[#f1f3f6] shrink-0 flex items-center justify-center relative">
                  {product.banner ? (
                    <img
                      src={product.banner}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="text-[#c2c2c2] w-6 h-6" />
                  )}
                  {/* Mobile Status Indicator */}
                  <div className="lg:hidden absolute top-1 right-1">
                    <span
                      className={`block w-2.5 h-2.5 rounded-full ${product.isActive ? "bg-green-500" : "bg-gray-400 border border-white"}`}></span>
                  </div>
                </div>

                {/* Mobile Info (Hidden on Desktop) */}
                <div className="flex-1 min-w-0 lg:hidden">
                  <p className="text-[14px] font-medium text-[#212121] line-clamp-2 leading-tight mb-1">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-2 text-[13px]">
                    <span className="font-semibold text-[#212121]">
                      {formatPKR(product.price)}
                    </span>
                    <StockBadge stock={product.stock} />
                  </div>
                </div>

                {/* Product Name (Desktop) */}
                <div className="hidden lg:flex flex-col min-w-0 pr-4">
                  <p className="text-[14px] font-medium text-[#212121] line-clamp-2 leading-snug group-hover:text-[#2874F0] transition-colors">
                    {product.name}
                  </p>
                  <span className="text-[11px] text-[#878787] font-mono mt-1 truncate">
                    ID: {product.id}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="hidden lg:flex flex-col">
                <span className="text-[14px] font-semibold text-[#212121]">
                  {formatPKR(product.price)}
                </span>
                {disc > 0 && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[12px] text-[#878787] line-through">
                      {formatPKR(product.originalPrice)}
                    </span>
                    <span className="text-[11px] font-bold text-[#388e3c]">
                      {disc}% OFF
                    </span>
                  </div>
                )}
              </div>

              {/* Stock */}
              <div className="hidden lg:block">
                <StockBadge stock={product.stock} />
              </div>

              {/* Status */}
              <div className="hidden lg:block">
                <StatusPill isActive={product.isActive} />
              </div>

              {/* Visibility Toggle */}
              <div className="hidden lg:flex justify-center">
                <button
                  onClick={() => handleToggleVisibility(product)}
                  title={product.isActive ? "Hide from store" : "Show on store"}
                  className={`p-2 rounded-full transition-all ${
                    product.isActive
                      ? "text-[#2874F0] bg-blue-50 hover:bg-blue-100"
                      : "text-[#878787] bg-gray-100 hover:bg-gray-200"
                  }`}>
                  {product.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>

              {/* Actions */}
              <div className="flex lg:justify-end gap-2 mt-3 lg:mt-0 w-full lg:w-auto border-t border-gray-100 pt-3 lg:border-0 lg:pt-0">
                <button
                  onClick={() => navigate(`/products/edit/${product.id}`)}
                  title="Edit Product"
                  className="flex-1 lg:flex-none flex items-center justify-center p-2 text-[#878787] hover:text-[#2874F0] hover:bg-blue-50 rounded-sm transition-colors border border-transparent hover:border-blue-100">
                  <Edit2 size={16} />
                </button>

                <a
                  href={`/product/${product.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  title="View Live Product"
                  className="flex-1 lg:flex-none flex items-center justify-center p-2 text-[#878787] hover:text-[#2e7d32] hover:bg-green-50 rounded-sm transition-colors border border-transparent hover:border-green-100">
                  <ExternalLink size={16} />
                </a>

                <button
                  onClick={() => setDeleteTarget(product)}
                  title="Delete Product"
                  className="flex-1 lg:flex-none flex items-center justify-center p-2 text-[#878787] hover:text-[#c62828] hover:bg-red-50 rounded-sm transition-colors border border-transparent hover:border-red-100">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Row */}
      {hasMore && (
        <div className="border-t border-gray-200 bg-[#f9fafb] p-4 flex justify-center">
          <button
            onClick={() => {
              /* Assuming loadProducts is passed or handled via parent. The parent manages loadingMore state. */
            }}
            disabled={loadingMore}
            className="flex items-center gap-2 px-6 py-2 bg-white border border-[#d7d7d7] text-[#212121] text-[14px] font-medium rounded-sm shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50">
            {loadingMore && (
              <Loader2 size={16} className="animate-spin text-[#2874F0]" />
            )}
            {loadingMore ? "Loading..." : "Load More Products"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductTable;
