import React, { useMemo } from "react";
import { Tag } from "lucide-react";

const CartSummary = ({
  subtotal = 0,
  originalTotalPrice = 0,
  gstAmount = 0,
  platformFee = 0,
  onPlaceOrder,
  btnText = "PLACE ORDER",
  selectedItems = [],
  addressPage = false, // new prop
  button = true,
}) => {
  const selectedCount = selectedItems.length;

  const discountOnMrp = useMemo(() => {
    const diff = originalTotalPrice - subtotal;
    return diff > 0 ? diff : 0;
  }, [originalTotalPrice, subtotal]);

  const total = useMemo(
    () => subtotal + gstAmount + platformFee,
    [subtotal, gstAmount, platformFee],
  );

  const formatPrice = (val) =>
    Number(val).toLocaleString("en-IN", { maximumFractionDigits: 0 });

  const confetti = Array.from({ length: 14 });

  return (
    <div className="w-full bg-white border border-gray-200 shadow-md overflow-hidden font-sans space-y-3">
      {/* SAVINGS BANNER */}
      {discountOnMrp > 0 && (
        <div className="relative overflow-hidden bg-[#e8f5e9] text-[#1b5e20] flex items-center gap-2 px-4 py-2  text-[12px] sm:text-[13px] font-semibold">
          <Tag size={16} />
          You'll save ₹{formatPrice(discountOnMrp)} on this order!
          {/* Confetti */}
          <div className="absolute inset-0 pointer-events-none">
            {confetti.map((_, i) => (
              <span
                key={i}
                className="confetti-piece"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.8}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* DELIVERY ESTIMATES */}
      {addressPage && selectedCount > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="px-4 py-2 text-[12px] sm:text-[13px] font-bold text-gray-700 uppercase tracking-wide">
              Delivery Estimates
            </h3>
          </div>

          <div className="space-y-3 p-3 border border-gray-100 ">
            {selectedItems.map((item, index) => (
              <React.Fragment key={item.id || index}>
                <div className="flex items-center gap-3">
                  <img
                    src={item.image || "/api/placeholder/48/64"}
                    alt="Product"
                    className="w-10 h-10 sm:w-8 sm:h-12 md:h-8 object-cover  border border-gray-200 bg-white"
                  />
                  <div className="text-[12px] sm:text-[13px] text-gray-700 flex-1">
                    <p className="line-clamp-1 font-medium">
                      {item.name || "Item"}
                    </p>
                    <p className="text-gray-500 mt-0.5">
                      Delivery by{" "}
                      <span className="font-bold text-gray-800">
                        {item.deliveryText}
                      </span>
                    </p>
                  </div>
                </div>
                {index < selectedItems.length - 1 && (
                  <hr className="border-gray-200" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* PRICE DETAILS */}
      <div>
        <div className="p-4 sm:px-5 sm:py-2">
          <h3 className="text-[11px] sm:text-[12px] font-bold text-gray-800 uppercase tracking-wide mb-4">
            Price Details ({selectedCount} Item{selectedCount > 1 ? "s" : ""})
          </h3>

          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between text-[12px] sm:text-[13px] text-gray-600">
              <span>Total MRP</span>
              <span className="text-gray-800">
                ₹{formatPrice(originalTotalPrice)}
              </span>
            </div>

            {discountOnMrp > 0 && (
              <div className="flex justify-between text-[12px] sm:text-[13px] text-gray-600">
                <span>Discount on MRP</span>
                <span className="text-[#038d63] font-medium">
                  −₹{formatPrice(discountOnMrp)}
                </span>
              </div>
            )}

            {gstAmount > 0 && (
              <div className="flex justify-between text-[12px] sm:text-[13px] text-gray-600">
                <span>GST (Estimated)</span>
                <span className="text-gray-800">₹{formatPrice(gstAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-[12px] sm:text-[13px] text-gray-600">
              <span className="flex items-center gap-1">
                Convenience Fee
                <span className="text-[#f43397] font-semibold text-[10px] ml-1 cursor-pointer">
                  Know More
                </span>
              </span>

              <span>
                {platformFee === 0 ? (
                  <>
                    <span className="text-gray-400 line-through mr-1 text-[11px]">
                      ₹99
                    </span>
                    <span className="text-[#038d63] font-medium">FREE</span>
                  </>
                ) : (
                  <span className="text-gray-800">
                    ₹{formatPrice(platformFee)}
                  </span>
                )}
              </span>
            </div>
          </div>

          <hr className="border-gray-200 my-3 sm:my-4" />

          <div className="flex justify-between items-center text-[14px] sm:text-[15px]">
            <span className="font-bold text-gray-900">Total Amount</span>
            <span className="font-bold text-gray-900">
              ₹{formatPrice(total)}
            </span>
          </div>
        </div>

        {/* CHECKOUT BUTTON */}
        <div className="bg-[#fff0f5] pt-2 fixed md:static bottom-0 left-0 w-full shadow-lg">
          <div className="text-center text-[10px]  md:hidden sm:text-[11px] font-bold text-[#f43397] pb-2">
            {selectedCount} Item{selectedCount > 1 ? "s" : ""} selected for
            order
          </div>
          {button && (
            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={onPlaceOrder}
              className="w-full py-3.5 sm:py-3 bg-[#f43397] text-white text-[13px] sm:text-[14px] font-bold uppercase tracking-widest hover:bg-[#d82a85] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {btnText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
