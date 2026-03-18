import { Package, Star } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

// ─── ITEMS LIST ───
const OrderItemsList = ({ order, navigate }) => (
  <div className="bg-white sm:rounded-md sm:border border-gray-200">
    <div className="p-4 border-b border-gray-100">
      <h3 className="text-[12px] font-bold text-[#535766] uppercase tracking-widest">
        Items in Order ({order.items?.length || 0})
      </h3>
    </div>
    <div className="flex flex-col">
      {order.items?.map((item, idx) => (
        <div
          key={item.id || idx}
          className="p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
          <div className="flex gap-4">
            <Link
              to={`/product/${item.productId || item.slug}`}
              className="w-20 h-24 bg-gray-100 rounded-md overflow-hidden shrink-0 border border-gray-200">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="m-auto mt-8 text-gray-300" />
              )}
            </Link>
            <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
              <div>
                <h4 className="text-[14px] font-bold text-[#282C3F] line-clamp-2 leading-tight mb-1">
                  {item.name}
                </h4>
                <div className="flex items-center gap-2 text-[12px] text-[#535766]">
                  <span>
                    Size:{" "}
                    <strong className="text-[#282C3F]">
                      {item.selectedSize || "FS"}
                    </strong>
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span>
                    Qty:{" "}
                    <strong className="text-[#282C3F]">
                      {item.quantity || 1}
                    </strong>
                  </span>
                </div>
              </div>
              <p className="text-[14px] font-bold text-[#282C3F]">
                ₹{Number(item.price).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
          {order.orderStatus === "delivered" && (
            <div className="mt-4 pt-3 border-t border-gray-100 border-dashed">
              <button
                onClick={() =>
                  navigate(
                    `/product/${item.productId || item.slug}?review=true`,
                  )
                }
                className="text-[12px] font-bold text-[#FF3F6C] uppercase tracking-wide flex items-center gap-1.5 hover:text-[#d42c55] transition-colors">
                <Star size={14} /> Rate & Review Product
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default OrderItemsList;
