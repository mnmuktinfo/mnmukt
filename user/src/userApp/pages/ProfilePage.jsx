import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Heart,
  CreditCard,
  Headset,
  MapPin,
  User,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Bell,
  Settings,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  X,
  Home,
} from "lucide-react";
import { useAuth } from "../features/auth/context/UserContext";
import { useCart } from "../features/cart/context/CartContext";
import { useWishlist } from "../features/wishList/context/WishlistContext";

/* ─── Polished Design Tokens ────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap');

  .pp-root *, .pp-root *::before, .pp-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .pp-root {
    --brand      : #df0059;
    --brand-dim  : #c4004e;
    --brand-soft : #fce6ef;
    --brand-glow : rgba(223,0,89,0.15);
    
    --ink        : #09090b;
    --ink-2      : #3f3f46;
    --ink-3      : #71717a;
    --ink-4      : #a1a1aa;
    
    --surface    : #ffffff;
    --surface-2  : #f8fafc;
    --surface-3  : #f1f5f9;
    
    --border     : #e4e4e7;
    --border-2   : #d4d4d8;
    
    --radius-sm  : 10px;
    --radius-md  : 16px;
    --radius-lg  : 24px;
    
    --shadow-sm  : 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md  : 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
    --shadow-lg  : 0 20px 40px -4px rgba(0, 0, 0, 0.1), 0 8px 16px -8px rgba(0, 0, 0, 0.05);
    
    --font-serif : 'Instrument Serif', Georgia, serif;
    --font-sans  : 'Inter', system-ui, sans-serif;

    font-family  : var(--font-sans);
    color        : var(--ink);
    background   : var(--surface-2);
    min-height   : 100vh;
    padding-bottom: 80px;
  }

  /* ── Identity card hero ── */
  .pp-hero {
    position     : relative;
    padding      : 40px 24px 32px;
    display      : flex;
    flex-direction: column;
    align-items  : center;
    text-align   : center;
    border-bottom: 1px solid var(--surface-3);
    overflow     : hidden;
    background   : linear-gradient(180deg, var(--surface) 0%, var(--surface-2) 100%);
  }
  .pp-hero::before {
    content      : '';
    position     : absolute;
    inset        : 0;
    background   : radial-gradient(ellipse at 50% 0%, var(--brand-glow) 0%, transparent 65%);
    pointer-events: none;
  }

  /* ── Avatar ── */
  .pp-avatar-ring {
    width        : 104px;
    height       : 104px;
    border-radius: 50%;
    padding      : 3px;
    background   : linear-gradient(135deg, var(--brand) 0%, #ff6b9d 100%);
    margin-bottom: 16px;
    position     : relative;
    z-index      : 1;
    box-shadow   : var(--shadow-md);
  }
  .pp-avatar-inner {
    width        : 100%;
    height       : 100%;
    border-radius: 50%;
    overflow     : hidden;
    background   : var(--surface-3);
    border       : 3px solid var(--surface);
  }
  .pp-avatar-img {
    width: 100%; height: 100%; object-fit: cover; display: block;
  }
  .pp-avatar-initials {
    width        : 100%;
    height       : 100%;
    display      : flex;
    align-items  : center;
    justify-content: center;
    font-family  : var(--font-serif);
    font-size    : 32px;
    color        : var(--brand);
    background   : var(--brand-soft);
  }

  .pp-hero-name {
    font-family  : var(--font-serif);
    font-size    : 28px;
    color        : var(--ink);
    line-height  : 1.1;
    margin-bottom: 6px;
    position     : relative;
    z-index      : 1;
  }
  .pp-hero-email {
    font-size    : 14px;
    color        : var(--ink-3);
    margin-bottom: 20px;
    word-break   : break-all;
    position     : relative;
    z-index      : 1;
  }
  .pp-pill-row {
    display      : flex;
    gap          : 8px;
    flex-wrap    : wrap;
    justify-content: center;
    position     : relative;
    z-index      : 1;
  }
  .pp-pill {
    font-size    : 11px;
    font-weight  : 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding      : 6px 12px;
    border-radius: 100px;
    border       : 1px solid var(--border);
    color        : var(--ink-3);
    background   : var(--surface);
  }
  .pp-pill.verified  { background: #ecfdf5; border-color: #a7f3d0; color: #059669; }
  .pp-pill.unverified{ background: #fff7ed; border-color: #fed7aa; color: #c2410c; }
  .pp-pill.provider  { background: var(--brand-soft); border-color: #fbcfe8; color: var(--brand); }

  /* ── Stats bar ── */
  .pp-stats {
    display      : flex;
    border-top   : 1px solid var(--border);
  }
  .pp-stat-btn {
    flex         : 1;
    display      : flex;
    flex-direction: column;
    align-items  : center;
    gap          : 4px;
    padding      : 16px 8px;
    background   : none;
    border       : none;
    cursor       : pointer;
    transition   : all .2s ease;
    position     : relative;
  }
  .pp-stat-btn + .pp-stat-btn::before {
    content      : '';
    position     : absolute;
    left         : 0;
    top          : 25%;
    height       : 50%;
    width        : 1px;
    background   : var(--border);
  }
  .pp-stat-btn:hover { background: var(--surface-2); }
  .pp-stat-num {
    font-family  : var(--font-serif);
    font-size    : 24px;
    color        : var(--ink);
    line-height  : 1;
  }
  .pp-stat-lbl {
    font-size    : 10px;
    font-weight  : 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color        : var(--ink-4);
  }

  /* ── Edit profile button ── */
  .pp-edit-btn {
    display      : flex;
    align-items  : center;
    justify-content: center;
    gap          : 8px;
    width        : calc(100% - 48px);
    margin       : 0 24px 24px;
    height       : 44px;
    background   : var(--brand-soft);
    border       : 1px solid #fbcfe8;
    border-radius: var(--radius-sm);
    color        : var(--brand);
    font-family  : var(--font-sans);
    font-size    : 13px;
    font-weight  : 600;
    cursor       : pointer;
    transition   : all .2s ease;
  }
  .pp-edit-btn:hover {
    background   : #fce6ef;
    border-color : #f9a8d4;
    transform    : translateY(-2px);
  }

  /* ── Quick tiles ── */
  .pp-tiles {
    display      : grid;
    grid-template-columns: repeat(3, 1fr);
    gap          : 16px;
  }
  .pp-tile {
    display      : flex;
    flex-direction: column;
    align-items  : center;
    gap          : 10px;
    padding      : 20px 12px 16px;
    background   : var(--surface);
    border       : 1px solid var(--border);
    border-radius: var(--radius-md);
    cursor       : pointer;
    transition   : all .2s ease;
    position     : relative;
    box-shadow   : var(--shadow-sm);
  }
  .pp-tile:hover {
    border-color : var(--border-2);
    box-shadow   : var(--shadow-md);
    transform    : translateY(-2px);
  }
  .pp-tile:active { transform: translateY(0); }
  .pp-tile-icon {
    width        : 44px;
    height       : 44px;
    border-radius: var(--radius-sm);
    background   : var(--surface-2);
    display      : flex;
    align-items  : center;
    justify-content: center;
    position     : relative;
  }
  .pp-tile-badge {
    position     : absolute;
    top          : -6px;
    right        : -6px;
    min-width    : 18px;
    height       : 18px;
    padding      : 0 5px;
    background   : var(--brand);
    color        : #fff;
    font-size    : 10px;
    font-weight  : 700;
    border-radius: 100px;
    display      : flex;
    align-items  : center;
    justify-content: center;
    border       : 2px solid var(--surface);
    box-shadow   : var(--shadow-sm);
  }
  .pp-tile-lbl {
    font-size    : 12px;
    font-weight  : 500;
    color        : var(--ink-2);
  }

  /* ── Section ── */
  .pp-section-title {
    font-size    : 11px;
    font-weight  : 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color        : var(--ink-4);
    margin-bottom: 12px;
    padding-left : 4px;
  }
  .pp-card {
    background   : var(--surface);
    border       : 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow   : var(--shadow-md);
    overflow     : hidden;
  }

  /* ── Menu row ── */
  .pp-row {
    display      : flex;
    align-items  : center;
    gap          : 16px;
    padding      : 18px 24px;
    border-bottom: 1px solid var(--surface-3);
    background   : none;
    border-left  : none;
    border-right : none;
    border-top   : none;
    width        : 100%;
    cursor       : pointer;
    text-align   : left;
    transition   : all .2s ease;
  }
  .pp-row:last-child { border-bottom: none; }
  .pp-row:hover { background: var(--surface-2); padding-left: 28px; }
  .pp-row.danger:hover { background: #fff1f2; }
  .pp-row-icon {
    width        : 40px;
    height       : 40px;
    border-radius: var(--radius-sm);
    background   : var(--surface-2);
    display      : flex;
    align-items  : center;
    justify-content: center;
    flex-shrink  : 0;
  }
  .pp-row.danger .pp-row-icon { background: #ffe4e6; }
  .pp-row-text { flex: 1; min-width: 0; }
  .pp-row-label {
    font-size    : 15px;
    font-weight  : 500;
    color        : var(--ink);
    line-height  : 1.3;
  }
  .pp-row.danger .pp-row-label { color: #e11d48; }
  .pp-row-sub {
    font-size    : 13px;
    color        : var(--ink-4);
    margin-top   : 2px;
    white-space  : nowrap;
    overflow     : hidden;
    text-overflow: ellipsis;
  }
  .pp-row-chevron { color: var(--border-2); flex-shrink: 0; }

  /* ── Address Modal ── */
  .pp-modal-overlay {
    position     : fixed;
    inset        : 0;
    background   : rgba(9, 9, 11, 0.4);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    display      : flex;
    align-items  : center;
    justify-content: center;
    z-index      : 1000;
    padding      : 20px;
    animation    : fadeIn 0.2s ease-out;
  }
  .pp-modal {
    background   : var(--surface);
    width        : 100%;
    max-width    : 420px;
    border-radius: var(--radius-lg);
    box-shadow   : var(--shadow-lg);
    overflow     : hidden;
    animation    : slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .pp-modal-header {
    padding      : 24px;
    border-bottom: 1px solid var(--border);
    display      : flex;
    align-items  : center;
    justify-content: space-between;
  }
  .pp-modal-title {
    font-size    : 18px;
    font-weight  : 600;
    display      : flex;
    align-items  : center;
    gap          : 10px;
  }
  .pp-modal-close {
    background   : var(--surface-2);
    border       : none;
    width        : 32px;
    height       : 32px;
    border-radius: 50%;
    display      : flex;
    align-items  : center;
    justify-content: center;
    cursor       : pointer;
    color        : var(--ink-3);
    transition   : all .2s ease;
  }
  .pp-modal-close:hover { background: var(--border); color: var(--ink); }
  .pp-modal-body {
    padding      : 24px;
  }
  .pp-address-box {
    background   : var(--surface-2);
    border       : 1px dashed var(--border-2);
    border-radius: var(--radius-md);
    padding      : 20px;
    margin-bottom: 24px;
  }
  .pp-address-line { font-size: 15px; color: var(--ink); line-height: 1.5; }
  .pp-address-empty { text-align: center; color: var(--ink-4); padding: 20px 0; font-size: 14px; }

  .pp-modal-btn {
    width        : 100%;
    height       : 48px;
    background   : var(--brand);
    color        : #fff;
    border       : none;
    border-radius: var(--radius-sm);
    font-size    : 14px;
    font-weight  : 600;
    cursor       : pointer;
    transition   : all .2s ease;
    box-shadow   : 0 4px 12px rgba(223,0,89,0.25);
  }
  .pp-modal-btn:hover { background: var(--brand-dim); transform: translateY(-2px); }

  /* ── Info strip (email verify) ── */
  .pp-info-strip {
    display      : flex;
    align-items  : flex-start;
    gap          : 12px;
    padding      : 16px;
    background   : #fff7ed;
    border       : 1px solid #fed7aa;
    border-radius: var(--radius-md);
    font-size    : 13px;
    color        : #9a3412;
    line-height  : 1.4;
  }

  /* ── Layout ── */
  .pp-main {
    max-width    : 1080px;
    margin       : 0 auto;
    padding      : 40px 5%;
    display      : grid;
    grid-template-columns: 320px 1fr;
    gap          : 32px;
    align-items  : start;
  }
  @media (max-width: 860px) {
    .pp-main { grid-template-columns: 1fr; padding: 24px 5%; gap: 24px; }
    .pp-tiles { grid-template-columns: repeat(3, 1fr); gap: 12px; }
  }

  /* ── Animations ── */
  @keyframes pp-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { 
    from { opacity: 0; transform: translateY(30px) scale(0.98); } 
    to { opacity: 1; transform: translateY(0) scale(1); } 
  }
  
  .pp-card    { animation: pp-up .4s cubic-bezier(0.16, 1, 0.3, 1) both; }
  .pp-tiles   { animation: pp-up .4s .1s cubic-bezier(0.16, 1, 0.3, 1) both; }
  .pp-main > section > div:nth-child(2) { animation-delay: .15s; }
  .pp-main > section > div:nth-child(3) { animation-delay: .20s; }
  .pp-main > section > div:nth-child(4) { animation-delay: .25s; }

  /* ── Skeleton ── */
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  .pp-skel {
    background   : linear-gradient(90deg, var(--surface-3) 25%, var(--surface-2) 50%, var(--surface-3) 75%);
    background-size: 600px 100%;
    animation    : shimmer 1.4s infinite;
    border-radius: var(--radius-lg);
  }
`;

/* ─── Skeleton Component ─────────────────────────────────── */
const Skeleton = () => (
  <div className="pp-root">
    <style>{CSS}</style>
    <div className="pp-main">
      <div className="pp-card pp-skel" style={{ height: 420 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          className="pp-skel"
          style={{ height: 120, borderRadius: "var(--radius-md)" }}
        />
        <div className="pp-card pp-skel" style={{ height: 260 }} />
        <div className="pp-card pp-skel" style={{ height: 160 }} />
      </div>
    </div>
  </div>
);

/* ─── Quick Tile Component ───────────────────────────────── */
const Tile = ({
  icon: Icon,
  label,
  badge,
  onClick,
  color = "var(--ink-3)",
}) => (
  <button className="pp-tile" onClick={onClick}>
    <div className="pp-tile-icon">
      <Icon size={20} strokeWidth={1.8} color={color} />
      {badge > 0 && (
        <span className="pp-tile-badge">{badge > 9 ? "9+" : badge}</span>
      )}
    </div>
    <span className="pp-tile-lbl">{label}</span>
  </button>
);

/* ─── Menu Row Component ─────────────────────────────────── */
const Row = ({
  icon: Icon,
  label,
  sub,
  onClick,
  danger = false,
  iconColor = "var(--ink-3)",
}) => (
  <button className={`pp-row${danger ? " danger" : ""}`} onClick={onClick}>
    <div className="pp-row-icon">
      <Icon
        size={18}
        strokeWidth={1.8}
        color={danger ? "#e11d48" : iconColor}
      />
    </div>
    <div className="pp-row-text">
      <div className="pp-row-label">{label}</div>
      {sub && <div className="pp-row-sub">{sub}</div>}
    </div>
    <ChevronRight size={16} strokeWidth={2.5} className="pp-row-chevron" />
  </button>
);

/* ─── Section Component ──────────────────────────────────── */
const Section = ({ title, children }) => (
  <div>
    <div className="pp-section-title">{title}</div>
    <div className="pp-card">{children}</div>
  </div>
);

/* ─── Profile Page Main ──────────────────────────────────── */
const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, address, authLoading, actionLoading, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();

  // State for the Address Modal
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  if (authLoading) return <Skeleton />;
  if (!user) {
    navigate("/auth/login");
    return null;
  }

  /* ── Derived values ── */
  const displayName = user.name || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const cartCount = cart?.length || 0;
  const wishlistCount = wishlist?.length || 0;
  const avatarSrc = user.avatarUrl || null;

  const memberSince = user.createdAt?.seconds
    ? new Date(user.createdAt.seconds * 1000).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      })
    : null;

  const addressLine = address
    ? [address.city, address.state].filter(Boolean).join(", ")
    : null;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const accountItems = [
    {
      label: "Personal Details",
      icon: User,
      path: "/user/edit",
      sub:
        `${user.name || ""}${user.phone ? " · " + user.phone : ""}` ||
        "Name, DOB & gender",
    },
    {
      label: "Saved Addresses",
      icon: MapPin,
      // Open modal instead of navigating
      onClickOverride: () => setIsAddressModalOpen(true),
      sub: addressLine || "View your delivery locations",
    },
    {
      label: "Payments & Wallets",
      icon: CreditCard,
      path: "/user/edit",
      sub: "Cards, UPI & Balances",
    },
    {
      label: "Notifications",
      icon: Bell,
      path: "/user/edit",
      sub: user.notificationsEnabled ? "Alerts Enabled" : "Alerts Disabled",
    },
    { label: "Account Settings", icon: Settings, path: "/user/edit" },
  ];

  const supportItems = [
    {
      label: "Help & Support",
      icon: Headset,
      path: "/contact-us",
      sub: "Contact our team 24/7",
    },
    { label: "Privacy & Terms", icon: ShieldCheck, path: "/privacy-policy" },
  ];

  return (
    <div className="pp-root">
      <style>{CSS}</style>

      {/* ── ADDRESS MODAL ── */}
      {isAddressModalOpen && (
        <div
          className="pp-modal-overlay"
          onClick={() => setIsAddressModalOpen(false)}>
          <div className="pp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pp-modal-header">
              <div className="pp-modal-title">
                <MapPin color="var(--brand)" size={20} /> My Address
              </div>
              <button
                className="pp-modal-close"
                onClick={() => setIsAddressModalOpen(false)}>
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>

            <div className="pp-modal-body">
              <div className="pp-address-box">
                {address &&
                (address.line1 || address.city || address.pincode) ? (
                  <>
                    {address.line1 && (
                      <div className="pp-address-line">{address.line1}</div>
                    )}
                    <div
                      className="pp-address-line"
                      style={{ color: "var(--ink-3)", marginTop: 4 }}>
                      {[address.city, address.state, address.pincode]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  </>
                ) : (
                  <div className="pp-address-empty">
                    <Home
                      size={32}
                      color="var(--border-2)"
                      style={{ margin: "0 auto 12px" }}
                    />
                    No address saved yet. Update your profile to add one for
                    faster checkouts.
                  </div>
                )}
              </div>

              <button
                className="pp-modal-btn"
                onClick={() => {
                  setIsAddressModalOpen(false);
                  navigate("/user/edit");
                }}>
                {address ? "Edit Address Details" : "Add New Address"}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="pp-main">
        {/* ── SIDEBAR ─────────────────────────── */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="pp-card" style={{ animation: "pp-up .4s ease both" }}>
            {/* Hero */}
            <div className="pp-hero">
              <div className="pp-avatar-ring">
                <div className="pp-avatar-inner">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={displayName}
                      className="pp-avatar-img"
                    />
                  ) : (
                    <div className="pp-avatar-initials">{initials}</div>
                  )}
                </div>
              </div>

              <div className="pp-hero-name">{displayName}</div>
              <div className="pp-hero-email">{user.email}</div>

              <div className="pp-pill-row">
                {user.emailVerified ? (
                  <span className="pp-pill verified">✓ Verified</span>
                ) : (
                  <span className="pp-pill unverified">Unverified</span>
                )}
                <span className="pp-pill provider">
                  {user.provider || "email"}
                </span>
                <span className="pp-pill">{user.role || "user"}</span>
              </div>
            </div>

            {/* Edit button */}
            <button
              className="pp-edit-btn"
              onClick={() => navigate("/user/edit")}>
              <User size={15} /> Edit Profile Details
            </button>

            {/* Stats */}
            <div className="pp-stats">
              <button
                className="pp-stat-btn"
                onClick={() => navigate("/checkout/cart")}>
                <span className="pp-stat-num">{cartCount}</span>
                <span className="pp-stat-lbl">In Bag</span>
              </button>
              <button
                className="pp-stat-btn"
                onClick={() => navigate("/wishlist")}>
                <span className="pp-stat-num">{wishlistCount}</span>
                <span className="pp-stat-lbl">Saved</span>
              </button>
              <button
                className="pp-stat-btn"
                onClick={() => navigate("/user/orders")}>
                <span className="pp-stat-num">—</span>
                <span className="pp-stat-lbl">Orders</span>
              </button>
            </div>
          </div>

          {/* Account meta card */}
          <div
            className="pp-card"
            style={{
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}>
            {[
              { label: "Member since", value: memberSince || "—" },
              { label: "Gender", value: user.gender || "—" },
              {
                label: "Date of birth",
                value: user.dateOfBirth
                  ? new Date(user.dateOfBirth).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—",
              },
              { label: "Phone", value: user.phone || "—" },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 14,
                  borderBottom: "1px dashed var(--border)",
                  paddingBottom: 12,
                }}>
                <span style={{ color: "var(--ink-3)" }}>{label}</span>
                <span style={{ color: "var(--ink)", fontWeight: 500 }}>
                  {value}
                </span>
              </div>
            ))}
            {/* Marketing pref */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 14,
              }}>
              <span style={{ color: "var(--ink-3)" }}>Marketing emails</span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontWeight: 500,
                  color: user.marketingEmails ? "#15803d" : "var(--ink-4)",
                }}>
                {user.marketingEmails ? (
                  <>
                    <CheckCircle2 size={15} color="#15803d" /> On
                  </>
                ) : (
                  <>
                    <XCircle size={15} color="var(--ink-4)" /> Off
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Unverified email warning */}
          {!user.emailVerified && (
            <div className="pp-info-strip">
              <Bell
                size={18}
                color="#c2410c"
                style={{ flexShrink: 0, marginTop: 2 }}
              />
              <span>
                Please verify your email address to unlock all premium features
                and secure your account.
              </span>
            </div>
          )}
        </aside>

        {/* ── MAIN CONTENT ────────────────────── */}
        <section style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Quick tiles */}
          <div className="pp-tiles">
            <Tile
              icon={ShoppingBag}
              label="My Orders"
              badge={0}
              onClick={() => navigate("/user/orders")}
            />
            <Tile
              icon={Heart}
              label="Wishlist"
              badge={wishlistCount}
              onClick={() => navigate("/wishlist")}
              color="var(--brand)"
            />
            <Tile
              icon={Sparkles}
              label="Rewards"
              badge={0}
              onClick={() => navigate("/user/rewards")}
              color="#d97706"
            />
          </div>

          {/* Account */}
          <Section title="Account & Activity">
            {accountItems.map((item) => (
              <Row
                key={item.label}
                {...item}
                onClick={
                  item.onClickOverride
                    ? item.onClickOverride
                    : () => navigate(item.path)
                }
              />
            ))}
          </Section>

          {/* Support */}
          <Section title="Support & Legal">
            {supportItems.map((item) => (
              <Row
                key={item.label}
                {...item}
                onClick={() => navigate(item.path)}
              />
            ))}
          </Section>

          {/* Sign out */}
          <div className="pp-card">
            <Row
              icon={LogOut}
              label={actionLoading ? "Signing out…" : "Sign Out Securely"}
              sub={user.email}
              danger
              onClick={handleLogout}
            />
          </div>

          <div
            style={{
              textAlign: "center",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--ink-4)",
              padding: "8px 0",
            }}>
            Mnmukt · v2.0.4
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProfilePage;
