import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

/* ── Heroicons ── */
import {
  MagnifyingGlassIcon,
  UserIcon,
  ShoppingBagIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  GiftIcon,
  SparklesIcon,
  BeakerIcon,
  SunIcon,
} from "@heroicons/react/24/outline";

import { useAuth } from "../../auth/context/UserContext";
import { useCart } from "../../../context/TaruvedaCartContext";

/* ════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════ */
const BASE = "/taruveda-organic-shampoo-oil";

const NAV_LINKS = [
  { label: "Hair Care", href: `${BASE}/hair-care`, icon: BeakerIcon },
  { label: "Skin Care", href: `${BASE}/skin-care`, icon: SunIcon },
  { label: "Body Care", href: `${BASE}/body-care`, icon: SparklesIcon },
  { label: "Value Combos", href: `${BASE}/combos`, icon: GiftIcon },
];

const DROPDOWN_ITEMS = [
  { label: "Organic Oils", href: `${BASE}/category/organic-oils` },
  { label: "Herbal Shampoos", href: `${BASE}/category/herbal-shampoos` },
  { label: "Face Serums", href: `${BASE}/category/face-serums` },
  { label: "Body Scrubs", href: `${BASE}/category/body-scrubs` },
];

/* ════════════════════════════════════════════
   SMALL REUSABLES
════════════════════════════════════════════ */

/** Botanical leaf SVG accent — pure CSS, no image dep */
const LeafAccent = ({ className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 1.25-8 1.25S16 7 17 8z" />
  </svg>
);

/** Single desktop nav link with animated underline */
const NavLink = ({ href, label, icon: Icon }) => (
  <Link
    to={href}
    className="group relative flex items-center gap-1.5 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#2a3d22] hover:text-[#429828] transition-colors duration-300">
    <Icon className="w-3.5 h-3.5 text-[#7aad5a] group-hover:scale-110 transition-transform duration-300" />
    {label}
    {/* animated underline */}
    <span className="absolute bottom-2.5 left-0 w-0 h-px bg-[#429828] group-hover:w-full transition-all duration-500 ease-out" />
  </Link>
);

/** Icon button wrapper */
const IconBtn = ({ className = "", children, ...props }) => (
  <button
    className={`relative flex items-center justify-center rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#429828] ${className}`}
    {...props}>
    {children}
  </button>
);

/* ════════════════════════════════════════════
   SEARCH BAR
════════════════════════════════════════════ */
const SearchBar = ({
  placeholder = "Search organic essentials…",
  inputClass = "",
}) => (
  <div className="relative group w-full">
    <input
      type="text"
      placeholder={placeholder}
      className={`w-full bg-[#f5f0e8]/60 border border-[#c8b89a]/40 rounded-full py-2.5 pl-5 pr-11
        text-[13px] text-[#2a3d22] placeholder:text-[#8a7a62]/70
        focus:outline-none focus:border-[#429828]/60 focus:bg-[#f5f0e8]
        transition-all duration-300 ${inputClass}`}
    />
    <button
      className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center
      rounded-full text-[#8a7a62] hover:bg-[#429828] hover:text-white transition-all duration-300">
      <MagnifyingGlassIcon className="w-4 h-4" strokeWidth={2} />
    </button>
  </div>
);

/* ════════════════════════════════════════════
   MOBILE DRAWER
════════════════════════════════════════════ */
const MobileDrawer = ({ open, onClose, user, totalItems }) => {
  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[100] bg-[#0d1f12]/50 backdrop-blur-sm transition-opacity duration-400 lg:hidden
          ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      {/* Drawer panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-[82%] max-w-[340px] z-[110] bg-[#f5f0e8] flex flex-col
          shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden
          ${open ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#d6c9b0]/60 bg-[#0d1f12]">
          <div>
            <span
              className="text-xl font-bold tracking-tight text-[#f5f0e8]"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              TARUVEDA
            </span>
            <span className="block text-[9px] tracking-[0.28em] text-[#7aad5a] font-bold uppercase mt-0.5">
              Organic Farms
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#f5f0e8]/10 text-[#f5f0e8] hover:bg-[#429828] transition-colors duration-300">
            <XMarkIcon className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-4 border-b border-[#d6c9b0]/60">
          <SearchBar placeholder="Search products…" inputClass="bg-white/80" />
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-2">
          {NAV_LINKS.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              to={href}
              onClick={onClose}
              className="flex items-center gap-4 px-6 py-4 border-b border-[#d6c9b0]/40
                text-[13px] font-bold text-[#2a3d22] hover:bg-[#e8dfc8] hover:text-[#429828] transition-colors duration-200">
              <Icon className="w-5 h-5 text-[#7aad5a] shrink-0" />
              {label}
            </Link>
          ))}

          {/* Dropdown items flat in mobile */}
          <div className="px-6 pt-5 pb-2">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#8a7a62] mb-3">
              Shop by Category
            </p>
            {DROPDOWN_ITEMS.map(({ label, href }) => (
              <Link
                key={label}
                to={href}
                onClick={onClose}
                className="block py-2.5 text-[13px] text-[#4a5c3a] hover:text-[#429828] font-medium transition-colors duration-200">
                — {label}
              </Link>
            ))}
          </div>

          {/* Collective badge */}
          <div className="px-6 py-4 border-t border-[#d6c9b0]/40 mt-2">
            <Link
              to={`${BASE}/collective`}
              onClick={onClose}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0d1f12] text-[#f5f0e8]
                text-[11px] font-black uppercase tracking-widest hover:bg-[#429828] transition-colors duration-300">
              <LeafAccent className="w-3.5 h-3.5 text-[#7aad5a]" />
              Join the Collective
            </Link>
          </div>
        </nav>

        {/* Footer auth */}
        <div className="px-6 py-5 bg-[#e8dfc8] border-t border-[#d6c9b0]/60">
          {user ? (
            <Link
              to="/user/profile"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-[#429828] text-white
                text-[12px] font-black uppercase tracking-widest hover:bg-[#2d621b] transition-colors duration-300 shadow-md">
              Hi, {user.name?.split(" ")[0] || "User"} 👋
            </Link>
          ) : (
            <Link
              to="/auth/login"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-full border border-[#2a3d22]
                text-[12px] font-black uppercase tracking-widest text-[#2a3d22] hover:bg-[#0d1f12] hover:text-white hover:border-transparent
                transition-all duration-300">
              <UserIcon className="w-4 h-4" />
              Sign In
            </Link>
          )}
        </div>
      </aside>
    </>
  );
};

/* ════════════════════════════════════════════
   MAIN HEADER
════════════════════════════════════════════ */
export default function TaruVedaHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  const { user } = useAuth();
  const { totalItems } = useCart();

  /* Close mobile menu on route change */
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  /* Sticky scroll shadow */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* Close dropdown on outside click */
  useEffect(() => {
    const fn = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdown(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <>
      {/* ── 1. Announcement bar ─────────────────────── */}
      <div className="w-full bg-[#0d1f12] text-[#f5f0e8] py-2.5 px-4 flex items-center justify-center gap-6 relative overflow-hidden">
        {/* subtle texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <LeafAccent className="w-3 h-3 text-[#7aad5a] shrink-0" />
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-center">
          International Store Now Live — Global Shipping Available
        </p>
        <LeafAccent className="w-3 h-3 text-[#7aad5a] shrink-0 scale-x-[-1]" />
      </div>

      {/* ── 2. Main sticky header ───────────────────── */}
      <header
        className={`sticky top-0 w-full z-40 transition-all duration-500
          ${
            scrolled
              ? "bg-[#f5f0e8]/96 backdrop-blur-md shadow-[0_2px_24px_rgba(13,31,18,0.08)]"
              : "bg-[#f5f0e8]"
          }`}>
        {/* Top row: hamburger | search — wordmark — icons */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <div
            className={`flex items-center justify-between transition-all duration-400 ${scrolled ? "py-3" : "py-5 sm:py-6"}`}>
            {/* Left */}
            <div className="flex flex-1 items-center gap-3">
              {/* Mobile hamburger */}
              <IconBtn
                onClick={() => setMobileOpen(true)}
                className="lg:hidden w-10 h-10 text-[#2a3d22] hover:bg-[#e8dfc8]">
                <Bars3Icon className="w-6 h-6" strokeWidth={2} />
              </IconBtn>

              {/* Desktop search */}
              <div className="hidden lg:block w-[280px] xl:w-[340px]">
                <SearchBar />
              </div>
            </div>

            {/* Center: wordmark */}
            <div className="flex-1 flex justify-center">
              <Link
                to={BASE}
                className="group flex flex-col items-center select-none">
                {/* Botanical top accent */}
                <div className="flex items-center gap-1.5 mb-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <LeafAccent className="w-2.5 h-2.5 text-[#7aad5a]" />
                  <div className="h-px w-6 bg-[#7aad5a]/60" />
                  <LeafAccent className="w-2.5 h-2.5 text-[#7aad5a] scale-x-[-1]" />
                </div>
                <h1
                  className="text-2xl sm:text-3xl lg:text-[2.1rem] font-bold tracking-[0.06em] text-[#0d1f12]
                    group-hover:text-[#2d621b] transition-colors duration-500"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    letterSpacing: "0.12em",
                  }}>
                  TARUVEDA
                </h1>
                <span className="text-[8px] sm:text-[9px] tracking-[0.38em] text-[#7aad5a] font-black uppercase mt-0.5">
                  Organic Farms
                </span>
              </Link>
            </div>

            {/* Right: action icons */}
            <div className="flex flex-1 justify-end items-center gap-1 sm:gap-2">
              {/* User */}
              {user ? (
                <Link
                  to="/user/profile"
                  className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full
                    hover:bg-[#e8dfc8] transition-all duration-300 group">
                  <div
                    className="w-8 h-8 rounded-full bg-[#0d1f12] text-[#f5f0e8] flex items-center justify-center
                    text-[11px] font-black group-hover:bg-[#429828] transition-colors duration-300 shrink-0">
                    {user.name ? (
                      user.name.charAt(0).toUpperCase()
                    ) : (
                      <UserIcon className="w-4 h-4" />
                    )}
                  </div>
                  <span className="hidden lg:block text-[11px] font-bold uppercase tracking-[0.12em] text-[#2a3d22] truncate max-w-[70px]">
                    {user.name?.split(" ")[0] || "Profile"}
                  </span>
                </Link>
              ) : (
                <Link
                  to="/auth/login"
                  className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full
                    text-[#2a3d22] hover:bg-[#e8dfc8] transition-all duration-300">
                  <UserIcon className="w-[22px] h-[22px]" strokeWidth={1.5} />
                </Link>
              )}

              {/* Cart */}
              <Link
                to={`${BASE}/cart`}
                className="relative w-10 h-10 flex items-center justify-center rounded-full
                  text-[#2a3d22] hover:bg-[#e8dfc8] transition-all duration-300 group">
                <ShoppingBagIcon
                  className="w-[22px] h-[22px] group-hover:scale-110 transition-transform duration-300"
                  strokeWidth={1.5}
                />
                {totalItems > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-[#429828] text-white
                    text-[9px] font-black flex items-center justify-center rounded-full border-2 border-[#f5f0e8] shadow-sm">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* ── 3. Desktop bottom nav row ─────────────── */}
        <div
          className={`hidden lg:block border-t border-[#c8b89a]/30 transition-all duration-400
          ${scrolled ? "h-0 overflow-hidden opacity-0 border-transparent" : "opacity-100"}`}>
          <div className="max-w-[1440px] mx-auto px-10">
            <ul className="flex items-center justify-center gap-10">
              {/* Static links */}
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <NavLink {...link} />
                </li>
              ))}

              {/* Shop by Category dropdown */}
              <li ref={dropdownRef} className="relative">
                <button
                  onClick={() => setDropdown((v) => !v)}
                  className="group flex items-center gap-1.5 py-4 text-[11px] font-bold uppercase
                    tracking-[0.18em] text-[#2a3d22] hover:text-[#429828] transition-colors duration-300 focus:outline-none">
                  Shop by Category
                  <ChevronDownIcon
                    className={`w-3.5 h-3.5 mt-px transition-transform duration-400 ${dropdownOpen ? "rotate-180 text-[#429828]" : ""}`}
                    strokeWidth={2.5}
                  />
                </button>

                {/* Dropdown panel */}
                <div
                  className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 transition-all duration-300
                  ${dropdownOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"}`}>
                  <div
                    className="bg-[#f5f0e8] border border-[#c8b89a]/50 shadow-[0_12px_40px_rgba(13,31,18,0.12)]
                    rounded-2xl py-2 w-52 overflow-hidden">
                    {/* decorative top strip */}
                    <div className="h-1 bg-gradient-to-r from-[#7aad5a] via-[#429828] to-[#7aad5a] mb-2" />
                    {DROPDOWN_ITEMS.map(({ label, href }) => (
                      <Link
                        key={label}
                        to={href}
                        onClick={() => setDropdown(false)}
                        className="flex items-center gap-2.5 px-5 py-2.5 text-[12px] font-medium text-[#4a5c3a]
                          hover:bg-[#e8dfc8] hover:text-[#2d621b] transition-colors duration-200 group">
                        <LeafAccent className="w-3 h-3 text-[#7aad5a] opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0" />
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              </li>

              {/* Collective pill */}
              <li>
                <Link
                  to={`${BASE}/collective`}
                  className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                    bg-[#0d1f12] text-[#f5f0e8] border border-transparent
                    hover:bg-[#429828] transition-all duration-400 shadow-sm">
                  <LeafAccent className="w-3 h-3 text-[#7aad5a] group-hover:text-white transition-colors duration-300" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Join Collective
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Botanical divider — visible only when not scrolled */}
        {!scrolled && (
          <div className="h-px bg-gradient-to-r from-transparent via-[#7aad5a]/30 to-transparent" />
        )}
      </header>

      {/* ── 4. Mobile drawer ────────────────────────── */}
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        user={user}
        totalItems={totalItems}
      />
    </>
  );
}
