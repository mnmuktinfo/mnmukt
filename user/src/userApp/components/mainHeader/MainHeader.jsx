import React, { useState } from "react";
import {
  Menu,
  User,
  Send,
  Heart,
  ShoppingBag,
  LogOut,
  X,
  ChevronRight,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const MainHeader = ({ menuItems = [], onLogout }) => {
  const navigate = useNavigate();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-[100] bg-white border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-4 flex-1">
            {/* Hamburger */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // ✅ IMPORTANT
                setIsMobileMenuOpen(true);
              }}
              className="p-2 rounded-full hover:bg-gray-100 md:hidden">
              <Menu size={22} />
            </button>
          </div>

          {/* CENTER LOGO */}
          <button
            onClick={() => navigate("/")}
            className="text-3xl md:text-4xl font-serif font-bold text-[#7A1F6E]">
            Mnmukt
          </button>

          {/* RIGHT */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            {/* USER DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen((p) => !p)}
                className="p-2 rounded-full hover:bg-gray-100">
                <User size={22} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white border rounded-xl shadow-xl">
                  <div className="px-5 py-4 border-b bg-gray-50">
                    <p className="text-sm font-semibold">My Account</p>
                  </div>

                  <div className="py-2">
                    {menuItems.map((item, idx) => (
                      <Link
                        key={idx}
                        to={item.path}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-5 py-3 text-sm hover:bg-gray-50">
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  {onLogout && (
                    <div className="border-t p-2">
                      <button
                        onClick={() => {
                          onLogout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ICONS */}
            <button className="p-2 hover:bg-gray-100 rounded-full hidden sm:block">
              <Send size={20} />
            </button>

            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Heart size={22} />
            </button>

            <button className="p-2 hover:bg-gray-100 rounded-full">
              <ShoppingBag size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* ================= OVERLAY ================= */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[150]"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ================= DRAWER ================= */}
      <aside
        onClick={(e) => e.stopPropagation()} // ✅ IMPORTANT
        className={`fixed top-0 left-0 h-full w-[80%] max-w-[320px] bg-white z-[160]
        transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="h-20 px-6 flex items-center justify-between border-b">
            <span className="text-2xl font-serif font-bold text-[#7A1F6E]">
              Mnmukt
            </span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100">
              <X size={22} />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto">
            {menuItems.map((item, idx) => (
              <Link
                key={idx}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                <span className="text-sm font-medium">{item.label}</span>
                <ChevronRight size={16} />
              </Link>
            ))}
          </div>

          {/* Drawer Footer */}
          {onLogout && (
            <div className="p-4 border-t">
              <button
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 text-red-600 border rounded-xl hover:bg-red-50">
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default MainHeader;
