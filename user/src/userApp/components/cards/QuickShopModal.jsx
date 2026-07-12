import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  XMarkIcon,
  MinusIcon,
  PlusIcon,
  HeartIcon,
  ShareIcon,
  PencilIcon,
  StarIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartSolidIcon,
  StarIcon as StarSolidIcon,
} from "@heroicons/react/24/solid";
import { UPIIcon } from "../../features/account/components/bars/Icons";

const THEME_PINK = "#da127d";
const THEME_PINK_LIGHT = "#fdf2f8";
const THEME_PINK_BORDER = "#fbcfe8";

// Size chart data
const SIZE_CHART_DATA = {
  in: [
    { size: "XS", bust: '34"', shoulder: '13.5"', waist: '38"' },
    { size: "S", bust: '36"', shoulder: '14"', waist: '39"' },
    { size: "M", bust: '38"', shoulder: '14.5"', waist: '40"' },
    { size: "L", bust: '40"', shoulder: '15"', waist: '41"' },
    { size: "XL", bust: '42"', shoulder: '15.5"', waist: '42"' },
    { size: "XXL", bust: '44"', shoulder: '16"', waist: '43"' },
    { size: "3XL", bust: '46"', shoulder: '16.5"', waist: '44"' },
  ],
  cm: [
    { size: "XS", bust: "86", shoulder: "34", waist: "96" },
    { size: "S", bust: "91", shoulder: "35", waist: "99" },
    { size: "M", bust: "96", shoulder: "36", waist: "101" },
    { size: "L", bust: "101", shoulder: "38", waist: "104" },
    { size: "XL", bust: "106", shoulder: "39", waist: "106" },
    { size: "XXL", bust: "111", shoulder: "40", waist: "109" },
    { size: "3XL", bust: "116", shoulder: "42", waist: "112" },
  ],
};

const MAX_QUANTITY = 999;
const MIN_QUANTITY = 1;

/* =========================================================
   STAR RATING COMPONENT
========================================================= */
const StarRating = ({ rating = 5, reviews = 0 }) => (
  <div className="flex items-center gap-2">
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <StarSolidIcon
          key={i}
          className={`w-3.5 h-3.5 ${
            i < Math.floor(rating) ? "text-[#da127d]" : "text-gray-300"
          }`}
        />
      ))}
    </div>
    {reviews > 0 && (
      <span className="text-xs sm:text-sm text-gray-600 font-medium">
        ({reviews} {reviews === 1 ? "review" : "reviews"})
      </span>
    )}
  </div>
);

/* =========================================================
   SIZE CHART MODAL
========================================================= */
const SizeChartModal = ({ isOpen, onClose, chartUnit, onChartUnitChange }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-chart-title">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-3xl  shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div
          className="flex justify-between items-center p-4 sm:p-6 border-b-2"
          style={{ borderColor: THEME_PINK_BORDER }}>
          <h3
            id="size-chart-title"
            className="font-bold text-lg sm:text-xl"
            style={{ color: THEME_PINK }}>
            Size Chart
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-pink-50  transition-colors"
            aria-label="Close size chart">
            <XMarkIcon className="w-5 h-5 text-gray-600" strokeWidth={2} />
          </button>
        </div>

        {/* Unit Toggle */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4">
          <div className="flex gap-2 p-1 bg-gray-100  w-fit">
            {["in", "cm"].map((unit) => (
              <button
                key={unit}
                onClick={() => onChartUnitChange(unit)}
                className={`px-3 sm:px-4 py-1.5  text-xs sm:text-sm font-semibold transition-all ${
                  chartUnit === unit
                    ? "text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                style={{
                  backgroundColor:
                    chartUnit === unit ? THEME_PINK : "transparent",
                }}
                aria-pressed={chartUnit === unit}>
                {unit === "in" ? "Inches" : "Centimeters"}
              </button>
            ))}
          </div>
        </div>

        {/* Table - Scrollable */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 overflow-x-auto flex-1">
          <table className="w-full min-w-[350px] text-sm sm:text-base">
            <thead>
              <tr style={{ backgroundColor: THEME_PINK }}>
                <th className="text-white font-semibold text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 text-left">
                  Size
                </th>
                <th className="text-white font-semibold text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 text-center">
                  Bust
                </th>
                <th className="text-white font-semibold text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 text-center">
                  Shoulder
                </th>
                <th className="text-white font-semibold text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 text-center">
                  Waist
                </th>
              </tr>
            </thead>
            <tbody>
              {SIZE_CHART_DATA[chartUnit].map((item, idx) => (
                <tr
                  key={item.size}
                  className={`border-b text-center transition-colors hover:bg-pink-50/50 ${
                    idx % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                  }`}
                  style={{ borderColor: THEME_PINK_BORDER }}>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">
                    {item.size}
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-700 text-xs sm:text-sm">
                    {item.bust}
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-700 text-xs sm:text-sm">
                    {item.shoulder}
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-700 text-xs sm:text-sm">
                    {item.waist}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   Helper — decide if a hex color reads as "light" so we know
   whether to draw a border/checkmark that's actually visible
   on it (e.g. white, cream, pale yellow swatches).
========================================================= */
const isLightColor = (hex) => {
  if (!hex || typeof hex !== "string") return false;
  const clean = hex.replace("#", "");
  if (clean.length !== 6 && clean.length !== 3) return false;
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);
  // perceived brightness
  return (r * 299 + g * 587 + b * 114) / 1000 > 200;
};

/* =========================================================
   QUICK SHOP MODAL
========================================================= */
const QuickShopModal = React.memo(
  ({
    product,
    image,
    formatPrice,
    onClose,
    onAddToCart,
    onBuyNow,
    onViewDetails,
    isLiked,
    onToggleWishlist,
    cartSyncing,
  }) => {
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [showSizeError, setShowSizeError] = useState(false);
    const [showColorError, setShowColorError] = useState(false);
    const [showSizeChart, setShowSizeChart] = useState(false);
    const [chartUnit, setChartUnit] = useState("in");
    const [isProcessing, setIsProcessing] = useState(false);

    // Disable body scroll when modal is open
    useEffect(() => {
      const originalStyle = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // ESC to close
      const handleKeyDown = (e) => {
        if (e.key === "Escape") onClose();
      };

      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.body.style.overflow = originalStyle;
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [onClose]);

    // Validate product
    const isValidProduct = useMemo(
      () => product && product.name && product.price !== undefined,
      [product],
    );

    // Trust ProductCard's hasSizes/hasColors flags instead of guessing —
    // this is what makes "no size" / "no color" products skip their
    // pickers entirely instead of being forced through a fake selection.
    const hasSizes = product?.hasSizes ?? product?.sizes?.length > 0;
    const hasColors = product?.hasColors ?? product?.colors?.length > 0;

    const availableSizes = useMemo(
      () => (hasSizes ? product.sizes : []),
      [hasSizes, product?.sizes],
    );
    const availableColors = useMemo(
      () => (hasColors ? product.colors : []),
      [hasColors, product?.colors],
    );

    // Auto-select immediately if there's only one option, so a single-size
    // or single-color product never blocks the user on a pointless choice.
    useEffect(() => {
      if (hasSizes && availableSizes.length === 1 && !selectedSize) {
        setSelectedSize(availableSizes[0]);
      }
      if (hasColors && availableColors.length === 1 && !selectedColor) {
        setSelectedColor(availableColors[0]);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasSizes, hasColors, availableSizes, availableColors]);

    // Handle quantity change with validation
    const handleQuantityChange = useCallback(
      (newQuantity) => {
        if (hasSizes && !selectedSize) {
          window.alert("Please select a size first");
          setShowSizeError(true);
          return;
        }
        if (hasColors && !selectedColor) {
          window.alert("Please select a color first");
          setShowColorError(true);
          return;
        }

        if (newQuantity < MIN_QUANTITY) return;
        if (newQuantity > MAX_QUANTITY) return;

        setQuantity(newQuantity);
      },
      [selectedSize, selectedColor, hasSizes, hasColors],
    );

    // Handle size selection
    const handleSizeSelect = useCallback((size) => {
      setSelectedSize(size);
      setShowSizeError(false);
    }, []);

    // Handle color selection
    const handleColorSelect = useCallback((color) => {
      setSelectedColor(color);
      setShowColorError(false);
    }, []);

    // Execute action with validation
    const handleAction = useCallback(
      async (action) => {
        let blocked = false;

        if (hasSizes && !selectedSize) {
          setShowSizeError(true);
          blocked = true;
        }
        if (hasColors && !selectedColor) {
          setShowColorError(true);
          blocked = true;
        }

        if (blocked) {
          window.alert(
            hasSizes && !selectedSize && hasColors && !selectedColor
              ? "Please select a size and color"
              : hasSizes && !selectedSize
                ? "Please select a size"
                : "Please select a color",
          );
          return;
        }

        if (isProcessing || cartSyncing) return;

        try {
          setIsProcessing(true);

          await action({
            // Sizeless/colorless products always report null/none, so
            // ProductCard's "onesize"/"default" sentinel logic downstream
            // stays consistent and nothing bogus gets baked into the order.
            selectedSize: hasSizes ? selectedSize : null,
            size: hasSizes ? selectedSize : null,
            selectedColor: hasColors ? selectedColor : null,
            color: hasColors ? selectedColor : null,
            quantity,
          });
        } catch (err) {
          console.error("Action error:", err);
        } finally {
          setIsProcessing(false);
        }
      },
      [
        selectedSize,
        selectedColor,
        quantity,
        cartSyncing,
        isProcessing,
        hasSizes,
        hasColors,
      ],
    );

    if (!isValidProduct) {
      return null; // Don't render if product is invalid
    }

    return (
      <>
        {/* MAIN MODAL */}
        <div
          className="fixed inset-0 z-500 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-0 md:p-4 animate-in fade-in duration-300"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
          aria-labelledby="modal-title">
          <div
            className="relative w-full h-[100vh] md:h-auto md:max-h-[90vh] md:max-w-[900px] bg-white  md: shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in slide-in-from-bottom-5 md:zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}>
            {/* Mobile Drag Indicator */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-300/80  md:hidden z-50" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-50 p-2 bg-white/90 backdrop-blur-md  text-gray-800 hover:bg-gray-100 shadow-md transition-colors md:hidden active:scale-95"
              aria-label="Close modal">
              <XMarkIcon className="w-5 h-5" strokeWidth={2.5} />
            </button>

            {/* Desktop Close Button */}
            <button
              onClick={onClose}
              className="hidden md:block absolute top-4 right-4 z-50 p-1.5 text-gray-500 hover:text-gray-800 transition-colors hover:bg-gray-100 "
              aria-label="Close modal">
              <XMarkIcon className="w-6 h-6" strokeWidth={2} />
            </button>

            {/* ================= LEFT: IMAGE ================= */}
            <div className="relative w-full md:w-[45%] h-[50vh] md:h-auto bg-gray-50 md:p-6 flex-shrink-0">
              <div className="w-full h-full md: overflow-hidden relative bg-gray-100">
                <img
                  src={image}
                  alt={product.name}
                  className="w-full h-full object-cover animate-in fade-in duration-500"
                  loading="lazy"
                  decoding="async"
                />

                {/* Heart Icon */}
                <button
                  onClick={onToggleWishlist}
                  className="absolute top-4 right-4 w-10 h-10 bg-white  flex items-center justify-center shadow-md hover:scale-110 transition-transform active:scale-95 z-10"
                  aria-label={
                    isLiked ? "Remove from wishlist" : "Add to wishlist"
                  }
                  aria-pressed={isLiked}>
                  {isLiked ? (
                    <HeartSolidIcon className="w-5 h-5 text-[#da127d]" />
                  ) : (
                    <HeartIcon
                      className="w-5 h-5 text-gray-700"
                      strokeWidth={1.5}
                    />
                  )}
                </button>
              </div>
            </div>

            {/* ================= RIGHT: DETAILS ================= */}
            <div className="flex flex-col flex-1 w-full md:w-[55%] overflow-hidden bg-white relative">
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-8 pb-40 md:pb-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h2
                    id="modal-title"
                    className="text-lg sm:text-xl md:text-2xl font-medium text-gray-900 leading-snug pr-2">
                    {product.name}
                  </h2>
                  <button
                    onClick={async () => {
                      try {
                        const shareData = {
                          title: product.name,
                          text: `Check out ${product.name}`,
                          url: window.location.href,
                        };

                        if (navigator.share) {
                          await navigator.share(shareData);
                        } else {
                          await navigator.clipboard.writeText(shareData.url);
                          window.alert("Link copied");
                        }
                      } catch (err) {
                        console.log(err);
                      }
                    }}
                    className="flex items-center gap-1 text-gray-600 hover:text-[#da127d]"
                    aria-label="Share product">
                    <ShareIcon className="w-5 h-5" strokeWidth={2} />
                    <span className="text-sm">Share</span>
                  </button>
                </div>

                {/* Star Rating */}
                {(product.rating !== undefined || product.reviews) && (
                  <div className="mb-4">
                    <StarRating
                      rating={product.rating || 5}
                      reviews={product.reviews || 0}
                    />
                  </div>
                )}

                {/* Price */}
                <div className="mb-6">
                  <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                    ₹{formatPrice(product.price)}
                  </p>
                  {product.originalPrice &&
                    product.originalPrice > product.price && (
                      <p className="text-sm text-gray-500 line-through">
                        ₹{formatPrice(product.originalPrice)}
                      </p>
                    )}
                </div>

                {/* Color Selector — only rendered when the product actually
                    has color options. Colorless products skip straight to
                    size (or quantity, if sizeless too). */}
                {hasColors && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      Color:{" "}
                      <span className="font-semibold text-[#da127d]">
                        {selectedColor?.name || "Select"}
                      </span>
                    </label>

                    <div className="flex flex-wrap gap-3">
                      {availableColors.map((color) => {
                        const active = selectedColor?.name === color.name;
                        const light = isLightColor(color.hex);
                        return (
                          <button
                            key={color.name}
                            onClick={() => handleColorSelect(color)}
                            title={color.name}
                            aria-pressed={active}
                            aria-label={color.name}
                            className={`relative w-9 h-9 rounded-full transition-all duration-200 flex items-center justify-center ${
                              active
                                ? "ring-2 ring-offset-2 shadow-md scale-105"
                                : "ring-1 ring-offset-1 ring-gray-200 hover:scale-105 hover:shadow-sm active:scale-95"
                            }`}
                            style={{
                              backgroundColor: color.hex || "#e5e7eb",
                              ...(active
                                ? { "--tw-ring-color": THEME_PINK }
                                : {}),
                              border: light ? "1px solid #d1d5db" : "none",
                            }}>
                            {active && (
                              <CheckIcon
                                className={`w-4 h-4 ${
                                  light ? "text-gray-800" : "text-white"
                                }`}
                                strokeWidth={3}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {showColorError && (
                      <div
                        className="mt-2 text-xs sm:text-sm text-red-500 font-medium animate-in slide-in-from-top-2"
                        role="alert">
                        ⚠️ Please select a color
                      </div>
                    )}
                  </div>
                )}

                {/* Size Selector — only rendered when the product actually
                    has size options. Sizeless products (accessories, etc.)
                    skip straight to quantity. */}
                {hasSizes && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      Size:{" "}
                      <span className="font-semibold text-[#da127d]">
                        {selectedSize || "Select"}
                      </span>
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => handleSizeSelect(size)}
                          className={`min-w-[44px] h-10 px-3 border text-xs sm:text-sm font-medium transition-all duration-200  ${
                            selectedSize === size
                              ? "bg-black text-white border-black shadow-md"
                              : "border-gray-300 text-gray-800 hover:border-[#da127d] hover:shadow-sm active:scale-95"
                          }`}
                          aria-pressed={selectedSize === size}>
                          {size}
                        </button>
                      ))}
                    </div>

                    {/* Size Chart Link */}
                    <button
                      onClick={() => setShowSizeChart(true)}
                      className="mt-4 text-xs text-gray-600 font-medium hover:text-[#da127d] flex items-center gap-1.5 uppercase tracking-wider transition-colors hover:bg-gray-100 px-2 py-1.5 "
                      aria-label="View size chart">
                      <PencilIcon className="w-4 h-4" /> SIZE CHART
                    </button>

                    {/* Error Message */}
                    {showSizeError && (
                      <div
                        className="mt-2 text-xs sm:text-sm text-red-500 font-medium animate-in slide-in-from-top-2"
                        role="alert">
                        ⚠️ Please select a size
                      </div>
                    )}
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Quantity
                  </label>
                  <div className="inline-flex items-center border border-gray-300  overflow-hidden">
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          Math.max(MIN_QUANTITY, quantity - 1),
                        )
                      }
                      disabled={quantity <= MIN_QUANTITY}
                      className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:bg-gray-100"
                      aria-label="Decrease quantity">
                      <MinusIcon className="w-4 h-4" strokeWidth={2} />
                    </button>
                    <span className="w-12 text-center font-semibold text-gray-900 text-sm">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          Math.min(MAX_QUANTITY, quantity + 1),
                        )
                      }
                      disabled={quantity >= MAX_QUANTITY}
                      className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:bg-gray-100"
                      aria-label="Increase quantity">
                      <PlusIcon className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </div>
                </div>

                {/* View Details Link */}
                <button
                  onClick={() => {
                    onViewDetails?.();
                    onClose();
                  }}
                  className="text-sm text-gray-700 hover:text-[#da127d] underline underline-offset-4 decoration-gray-400 hover:decoration-[#da127d] transition-colors font-medium">
                  View full details →
                </button>
              </div>

              {/* Sticky Action Buttons */}
              <div className="absolute md:static bottom-0 left-0 w-full bg-white border-t border-gray-200 md:border-none p-3 sm:p-4 md:px-8 md:pb-8 md:pt-4 flex gap-2 sm:gap-3 z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.08)] md:shadow-none">
                <button
                  onClick={() => handleAction(onAddToCart)}
                  disabled={cartSyncing || isProcessing}
                  className="flex-1 h-11 sm:h-12 border-2 font-semibold text-xs sm:text-sm tracking-[0.1em] uppercase transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-pink-50 active:scale-95 "
                  style={{
                    borderColor: THEME_PINK,
                    color: THEME_PINK,
                  }}
                  aria-label="Add to cart">
                  {cartSyncing || isProcessing ? "Adding..." : "ADD TO CART"}
                </button>
                <button
                  onClick={() => handleAction(onBuyNow)}
                  disabled={cartSyncing || isProcessing}
                  className="flex-1 h-11 sm:h-12 bg-black text-white font-semibold text-xs sm:text-sm tracking-[0.1em] uppercase transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-gray-900 active:scale-95 "
                  aria-label="Buy now">
                  {cartSyncing || isProcessing ? (
                    "Processing..."
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <UPIIcon />
                      <span>BUY NOW</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SIZE CHART MODAL — only meaningful if the product has sizes */}
        {hasSizes && (
          <SizeChartModal
            isOpen={showSizeChart}
            onClose={() => setShowSizeChart(false)}
            chartUnit={chartUnit}
            onChartUnitChange={setChartUnit}
          />
        )}
      </>
    );
  },
);

QuickShopModal.displayName = "QuickShopModal";

export default QuickShopModal;
