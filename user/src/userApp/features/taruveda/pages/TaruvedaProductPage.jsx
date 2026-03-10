import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Star,
  Plus,
  Search,
  User,
  Menu,
  X,
  Leaf,
  Check,
} from "lucide-react";
import { useCart } from "../../../context/TaruvedaCartContext";
import { productService } from "../services/productService";

const BASE_URL = "/taruveda-organic-shampoo-oil";

const navLinks = [
  { name: "Shop", value: "All" },
  { name: "Hair Care", value: "Hair Care" },
  { name: "Skin Care", value: "Skin Care" },
  { name: "Body Care", value: "Body Care" },
  { name: "Combo", value: "Combos" },
];

const secondaryLinks = ["Blogs", "Track Order", "Contact Us"];

export default function TaruvedaProductPage() {
  const { cart, addToCart, totalItems } = useCart();
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getTaruvedaProducts();
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, products]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] text-[#2C3E30]">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <Leaf className="w-8 h-8 text-[#2C3E30]" />
          <span className="tracking-widest uppercase text-xs font-bold">
            Loading...
          </span>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C2826] font-sans selection:bg-[#2C3E30] selection:text-white pb-20">
      {/* --- HEADER --- */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 bg-white 
           border-b border-gray-100 py-4
        `}>
        <div className="max-w-[1500px] mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setSelectedCategory("All")}>
            <Leaf className="w-6 h-6 text-green-700 group-hover:rotate-12 transition-transform duration-300" />
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold tracking-tight text-[#1a2e1f] leading-none">
                TARUVEDA
              </h1>

              <span className="text-[9px] uppercase tracking-[0.3em] text-green-800/60 ml-0.5">
                Organic Essentials
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => setSelectedCategory(link.value)}
                className={`text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 relative group py-2 ${
                  selectedCategory === link.value
                    ? "text-green-800"
                    : "text-gray-600 hover:text-green-800"
                }`}>
                {link.name}
                <span
                  className={`absolute bottom-0 left-0 w-full h-[2px] bg-green-700 transform transition-transform duration-300 origin-left ${
                    selectedCategory === link.value
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  }`}></span>
              </button>
            ))}
            <div className="h-4 w-[1px] bg-gray-300 mx-2"></div>
            {secondaryLinks.map((link) => (
              <button
                key={link}
                className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 hover:text-gray-600 transition-colors">
                {link}
              </button>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-5">
            <button className="text-gray-600 hover:text-green-800">
              <Search className="w-5 h-5" />
            </button>
            <Link
              to={"/user/profile"}
              className="hidden md:block text-gray-600 hover:text-green-800">
              <User className="w-5 h-5" />
            </Link>
            <Link
              to={`${BASE_URL}/cart`}
              className="relative text-gray-600 hover:text-green-800 group">
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-green-700 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              className="xl:hidden text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-gray-100 bg-white animate-in slide-in-from-top-2">
            <div className="flex flex-col p-4 gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => {
                    setSelectedCategory(link.value);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left text-xs font-bold uppercase tracking-widest py-2 border-b border-gray-50 ${
                    selectedCategory === link.value
                      ? "text-green-800"
                      : "text-gray-500"
                  }`}>
                  {link.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* --- PRODUCT GRID --- */}
      <main className="max-w-[1500px] mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 px-2 gap-2">
          <div>
            <span className="text-[10px] md:text-xs font-bold text-green-600 uppercase tracking-widest mb-2 block">
              Shop By Category
            </span>
            <h2 className="font-serif text-2xl md:text-4xl text-[#1a2e1f] capitalize">
              {selectedCategory === "All"
                ? "Curated Collection"
                : selectedCategory}
            </h2>
          </div>
          <span className="text-[10px] md:text-xs font-medium text-gray-400 uppercase tracking-wider">
            {filteredProducts.length} Products
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
          {filteredProducts.map((product) => {
            const inCart = cart[product.id]?.quantity || 0;

            return (
              <div
                key={product.id}
                className="group relative flex flex-col bg-white">
                {/* --- IMAGE CARD --- */}
                {/* Changed to white background and object-contain to match the clean product shots in the image */}
                <div className="relative w-full aspect-[4/5] md:aspect-square overflow-hidden bg-white mb-4 flex items-center justify-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-[85%] h-[85%] object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Optional: Add a "SOLD OUT" badge here if needed based on the 3rd product in your image */}
                </div>

                {/* --- PRODUCT INFO --- */}
                <div className="flex flex-col flex-grow w-full text-left px-1">
                  {/* Title */}
                  <h3 className="font-semibold text-sm md:text-[15px] text-[#333333] leading-tight mb-1 line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Category (lowercase like the image) */}
                  <p className="text-[11px] md:text-xs text-gray-400 mb-2 lowercase">
                    {product.category || "general wellness"}
                  </p>

                  {/* Price Block */}
                  <div className="mt-auto mb-4 flex items-baseline gap-1">
                    <span className="font-bold text-sm md:text-[15px] text-[#8CC63F]">
                      ₹{product.price}
                    </span>
                    <span className="text-[9px] md:text-[10px] text-gray-400 font-normal">
                      Including GST
                    </span>
                  </div>

                  {/* --- ACTION BUTTON --- */}
                  <div className="w-full">
                    {inCart === 0 ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product, 1);
                        }}
                        className="w-full bg-[#8CC63F] hover:bg-[#7AB334] text-white py-2.5 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-full transition-colors duration-300">
                        Add To Cart
                      </button>
                    ) : (
                      <div className="w-full border-2 border-[#8CC63F] text-[#8CC63F] bg-white py-2 text-[10px] md:text-xs font-bold uppercase tracking-wider text-center rounded-full flex items-center justify-center gap-1">
                        <Check className="w-4 h-4" /> Added ({inCart})
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* --- MOBILE FLOATING CHECKOUT BAR --- */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50 md:hidden animate-in slide-in-from-bottom-6 duration-500">
          <Link
            to={`${BASE_URL}/cart`}
            className="flex items-center justify-between bg-[#1a2e1f] text-white p-4 shadow-2xl backdrop-blur-xl bg-opacity-95 rounded-none">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 w-8 h-8 flex items-center justify-center text-sm font-bold">
                {totalItems}
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">
                View Bag
              </span>
            </div>
            <ShoppingBag className="w-4 h-4 opacity-80" />
          </Link>
        </div>
      )}
    </div>
  );
}
