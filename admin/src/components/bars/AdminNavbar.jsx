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
  FaLeaf,
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
      { title: "Taruveda Store", path: "/taruveda" },
    ],
    [],
  );

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex flex-col font-sans">
      {/* 1. PRIMARY HUD (Blue Header - Seller Hub Style) */}
      <div className="bg-[#2874F0] text-white shadow-md z-[105]">
        <div className="max-w-[1800px] mx-auto px-4 h-14 flex items-center justify-between gap-6">
          {/* Brand/Logo Section */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded transition-colors">
              {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>

            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center shadow-sm">
                <FaLeaf className="text-[#2874F0] text-lg" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-lg font-bold italic tracking-tight leading-none">
                  Taruveda
                </span>
                <span className="text-[10px] text-[#FFE500] font-bold uppercase tracking-widest mt-0.5">
                  Seller Hub
                </span>
              </div>
            </Link>
          </div>

          {/* CENTER SECTION: System Status */}
          <div className="hidden md:flex items-center gap-8 px-8 h-full border-x border-white/20">
            <div className="flex items-center gap-2">
              <FaCircle className="text-[#FFE500] text-[8px] animate-pulse" />
              <span className="text-[10px] font-bold text-blue-100 uppercase tracking-wider">
                System: Active
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-blue-100 uppercase tracking-wider">
                Region: Agra, IN
              </span>
            </div>
            <button
              onClick={() => window.open("/", "_blank")}
              className="flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-wider hover:text-[#FFE500] transition-colors active:scale-95">
              Visit Store <FaExternalLinkAlt size={10} />
            </button>
          </div>

          {/* Right Side Identity HUD */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0 relative">
            <button className="relative p-2 text-blue-100 hover:text-white transition-colors active:scale-90">
              <FaBell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ff356c] rounded-full border-2 border-[#2874F0]" />
            </button>

            <div className="h-6 w-[1px] bg-white/20 hidden sm:block mx-1"></div>

            <div>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1 rounded transition-colors hover:bg-white/10">
                <div className="hidden sm:block text-right">
                  <p className="text-[10px] text-blue-200 font-bold uppercase leading-none">
                    Admin
                  </p>
                  <p className="text-xs font-bold text-white flex items-center gap-1 mt-1">
                    Manage Account{" "}
                    <FaChevronDown
                      size={10}
                      className="text-blue-200 opacity-80"
                    />
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white text-[#2874F0] flex items-center justify-center shadow-sm">
                  <FaUserShield size={14} />
                </div>
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 top-12 mt-2 w-56 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 rounded-sm py-2 z-[110] animate-in fade-in slide-in-from-top-2 text-gray-800">
                  <div className="px-4 py-3 border-b border-gray-100 mb-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Authorized Session
                    </p>
                    <p className="text-sm font-bold text-gray-900 truncate mt-0.5">
                      admin@taruveda.com
                    </p>
                  </div>
                  <Link
                    to="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-blue-50 hover:text-[#2874F0] transition-colors">
                    <FaStore className="mr-3 text-lg" /> Registry Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 border-t border-gray-100 mt-1 transition-colors">
                    <FaSignOutAlt className="mr-3 text-lg" /> Terminate Session
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. SECONDARY NAVIGATION BAR (Desktop Tabs) */}
      <div className="bg-white border-b border-gray-200 hidden lg:block shadow-sm">
        <div className="max-w-[1800px] mx-auto px-4 flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative px-1 py-3 text-[12px] font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
                isActive(link.path)
                  ? "text-[#2874F0]"
                  : "text-gray-500 hover:text-gray-900"
              }`}>
              {link.title}
              {/* Active Tab Indicator */}
              {isActive(link.path) && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#2874F0] rounded-t-sm" />
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* 3. MOBILE DRAWER */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm">
          <div className="w-72 h-full bg-[#f1f3f6] animate-in slide-in-from-left duration-300 shadow-2xl flex flex-col">
            <div className="h-14 bg-[#2874F0] flex items-center px-6 justify-between text-white shrink-0 shadow-md z-10">
              <span className="font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                <FaLeaf className="text-[#FFE500]" /> Main Menu
              </span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-white hover:bg-white/20 p-2 rounded transition-colors">
                <FaTimes size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-white">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all border-b border-gray-50 ${
                    isActive(link.path)
                      ? "bg-blue-50/50 text-[#2874F0] border-l-4 border-l-[#2874F0]"
                      : "text-gray-600 hover:bg-gray-50 border-l-4 border-l-transparent"
                  }`}>
                  {link.title}
                </Link>
              ))}

              <div className="p-6 mt-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex justify-center items-center gap-2 px-4 py-3 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-red-50 transition-colors">
                  <FaSignOutAlt /> Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
