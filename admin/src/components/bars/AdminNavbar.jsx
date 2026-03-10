import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaBell,
  FaChevronDown,
  FaStore,
  FaUserShield,
  FaCircle,
  FaExternalLinkAlt,
} from "react-icons/fa";

export default function AdminNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = useMemo(
    () => [
      { title: "Dashboard", path: "/" },
      { title: "Inventory", path: "/products" },
      { title: "Categories", path: "/categories" },
      { title: "Shipments", path: "/orders" },
      { title: "Users", path: "/customers" },
      { title: "Testimonials", path: "/testimonials" },
      { title: "Taruveda", path: "/testimonials" },
    ],
    [],
  );

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-gray-200 shadow-sm font-sans">
      {/* 1. PRIMARY HUD (Identity & Status) */}
      <div className="max-w-[1800px] mx-auto px-4 h-14 flex items-center justify-between gap-6">
        {/* Brand/Logo Section */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded">
            {isMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#ff356c] rounded-sm flex items-center justify-center shadow-sm transition-transform active:scale-90">
              <span className="text-white font-black text-lg italic font-serif">
                M
              </span>
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-black tracking-tighter text-gray-800 uppercase block leading-none">
                Seller<span className="text-[#ff356c]">Central</span>
              </span>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                Admin HQ
              </span>
            </div>
          </Link>
        </div>

        {/* CENTER SECTION: System Status (Replaces Search) */}
        <div className="hidden md:flex items-center gap-8 border-x border-gray-100 px-8 h-full">
          <div className="flex items-center gap-2">
            <FaCircle className="text-emerald-500 text-[8px] animate-pulse" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Registry: Active
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Region: Agra, IN
            </span>
          </div>
          <button
            onClick={() => window.open("/", "_blank")}
            className="flex items-center gap-2 text-[10px] font-black text-[#ff356c] uppercase tracking-widest hover:underline active:scale-95">
            Visit Store <FaExternalLinkAlt size={10} />
          </button>
        </div>

        {/* Right Side Identity HUD */}
        <div className="flex items-center gap-2 md:gap-5 shrink-0">
          <button className="relative p-2 text-gray-400 hover:text-[#ff356c] transition-colors active:scale-90">
            <FaBell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ff356c] rounded-full border-2 border-white" />
          </button>

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 group hover:bg-gray-50 p-1.5 rounded-sm transition-colors border border-transparent hover:border-gray-200">
              <div className="w-8 h-8 rounded-sm bg-gray-900 text-white flex items-center justify-center text-xs font-black shadow-sm active:scale-90 transition-transform">
                <FaUserShield size={14} />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[10px] text-gray-400 font-black uppercase leading-none">
                  Superuser
                </p>
                <p className="text-xs font-bold text-gray-800 flex items-center gap-1 mt-1">
                  Admin Account{" "}
                  <FaChevronDown size={8} className="text-gray-300" />
                </p>
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white shadow-2xl border border-gray-200 rounded-sm py-2 z-[110] animate-in fade-in slide-in-from-top-1">
                <div className="px-4 py-3 border-b border-gray-50 mb-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    Authorized Session
                  </p>
                  <p className="text-xs font-bold text-gray-900 truncate">
                    admin@mnmukt.com
                  </p>
                </div>
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-xs font-bold text-gray-600 hover:bg-pink-50 hover:text-[#ff356c] transition-colors">
                  <FaStore className="inline mr-2" /> Registry Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 border-t border-gray-50 mt-1 transition-colors">
                  <FaSignOutAlt className="inline mr-2" /> Terminate Session
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION BAR (High Density Activity Bar) */}
      <div className="bg-[#fcfcfc] border-t border-gray-100 hidden lg:block">
        <div className="max-w-[1800px] mx-auto px-4 h-10 flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-1.5 text-[11px] font-black uppercase tracking-widest transition-all border border-transparent rounded-sm flex items-center gap-2 ${
                isActive(link.path)
                  ? "bg-white border-gray-200 text-[#ff356c] shadow-sm"
                  : "text-gray-500 hover:border-gray-200 hover:bg-white hover:text-[#ff356c]"
              }`}>
              {isActive(link.path) && (
                <div className="w-1 h-1 bg-[#ff356c] rounded-full" />
              )}
              {link.title}
            </Link>
          ))}
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm">
          <div className="w-72 h-full bg-white animate-in slide-in-from-left duration-300 shadow-2xl">
            <div className="h-16 bg-[#ff356c] flex items-center px-6 justify-between text-white">
              <span className="font-bold uppercase tracking-widest text-sm">
                Control Hub
              </span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-white p-2">
                <FaTimes />
              </button>
            </div>
            <div className="py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-8 py-4 text-xs font-black uppercase tracking-widest transition-all ${
                    isActive(link.path)
                      ? "bg-pink-50 text-[#ff356c] border-r-4 border-[#ff356c]"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}>
                  {link.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
