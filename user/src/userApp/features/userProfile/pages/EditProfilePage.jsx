import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/UserContext";
import { updateProfileData } from "../../auth/services/authService";
import {
  ArrowLeft,
  Loader2,
  Camera,
  MapPin,
  User,
  Bell,
  Shield,
  ChevronDown,
  Check,
} from "lucide-react";
import NotificationProduct from "../../../components/cards/NotificationProduct";
import Panel from "../components/Panel";
import Toggle from "../components/Toggle";

/* ─── Tokens & Polished CSS ─────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap');

  .ep-root *, .ep-root *::before, .ep-root *::after { box-sizing: border-box; margin: 0; }

  .ep-root {
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
    --shadow-lg  : 0 10px 25px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.025);
    
    --font-serif : 'Instrument Serif', Georgia, serif;
    --font-sans  : 'Inter', system-ui, sans-serif;

    font-family  : var(--font-sans);
    color        : var(--ink);
    background   : var(--surface-2);
    min-height   : 100vh;
    padding-bottom: 80px;
  }

  /* ── Nav ── */
  .ep-nav {
    background   : rgba(255,255,255,0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    height       : 72px;
    display      : flex;
    align-items  : center;
    justify-content: space-between;
    padding      : 0 5%;
    position     : sticky;
    top          : 0;
    z-index      : 100;
  }
  .ep-nav-back {
    display      : flex;
    align-items  : center;
    gap          : 8px;
    font-size    : 14px;
    font-weight  : 500;
    color        : var(--ink-2);
    background   : transparent;
    border       : 1px solid transparent;
    cursor       : pointer;
    padding      : 8px 16px 8px 12px;
    border-radius: var(--radius-sm);
    transition   : all .2s ease;
  }
  .ep-nav-back:hover { 
    color: var(--brand); 
    background: var(--brand-soft);
  }
  .ep-nav-title {
    font-family  : var(--font-serif);
    font-size    : 24px;
    color        : var(--ink);
    position     : absolute;
    left         : 50%;
    transform    : translateX(-50%);
  }
  .ep-nav-badge {
    display      : flex;
    align-items  : center;
    gap          : 6px;
    font-size    : 12px;
    font-weight  : 600;
    color        : var(--ink-2);
    background   : var(--surface);
    border       : 1px solid var(--border);
    padding      : 6px 14px;
    border-radius: 100px;
    box-shadow   : var(--shadow-sm);
  }
  .ep-nav-badge-dot {
    width  : 8px; height: 8px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 0 2px rgba(16,185,129,0.2);
  }

  /* ── Layout ── */
  .ep-main {
    max-width    : 1080px;
    margin       : 0 auto;
    padding      : 40px 5%;
    display      : grid;
    grid-template-columns: 320px 1fr;
    gap          : 32px;
    align-items  : start;
  }
  
  @media (max-width: 860px) {
    .ep-main { 
      grid-template-columns: 1fr; 
      padding: 24px 5%; 
      gap: 24px;
    }
    .ep-nav-title { display: none; }
  }

  /* ── Card ── */
  .ep-card {
    background   : var(--surface);
    border       : 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow   : var(--shadow-md);
    overflow     : hidden;
  }

  /* ── Sidebar ── */
  .ep-sidebar-hero {
    padding      : 40px 24px 32px;
    display      : flex;
    flex-direction: column;
    align-items  : center;
    text-align   : center;
    border-bottom: 1px solid var(--surface-3);
    position     : relative;
    background   : linear-gradient(180deg, var(--surface) 0%, var(--surface-2) 100%);
  }
  .ep-avatar-wrap {
    position     : relative;
    margin-bottom: 20px;
  }
  .ep-avatar {
    width        : 110px;
    height       : 110px;
    border-radius: 50%;
    object-fit   : cover;
    border       : 4px solid var(--surface);
    box-shadow   : 0 0 0 1px var(--border-2), var(--shadow-md);
    display      : block;
  }
  .ep-avatar-cam {
    position     : absolute;
    bottom       : 4px;
    right        : 4px;
    width        : 32px;
    height       : 32px;
    background   : var(--brand);
    border        : 3px solid var(--surface);
    border-radius : 50%;
    display       : flex;
    align-items   : center;
    justify-content: center;
    cursor        : pointer;
    transition    : all .2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  .ep-avatar-cam:hover { 
    background: var(--brand-dim); 
    transform: scale(1.15); 
  }
  .ep-sidebar-name {
    font-family  : var(--font-serif);
    font-size    : 28px;
    color        : var(--ink);
    line-height  : 1.1;
    margin-bottom: 6px;
  }
  .ep-sidebar-email {
    font-size    : 14px;
    color        : var(--ink-3);
    margin-bottom: 20px;
  }
  .ep-pill-row {
    display      : flex;
    gap          : 8px;
    flex-wrap    : wrap;
    justify-content: center;
  }
  .ep-pill {
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
  .ep-pill.verified { background: #ecfdf5; border-color: #a7f3d0; color: #059669; }
  .ep-pill.provider { background: var(--brand-soft); border-color: #fbcfe8; color: var(--brand); }

  /* Sidebar meta list */
  .ep-meta-list { padding: 24px; display: flex; flex-direction: column; gap: 4px; }
  .ep-meta-row {
    display      : flex;
    align-items  : center;
    justify-content: space-between;
    padding      : 12px 0;
    border-bottom: 1px dashed var(--border);
    font-size    : 14px;
  }
  .ep-meta-row:last-child { border-bottom: none; }
  .ep-meta-label { color: var(--ink-3); }
  .ep-meta-value { color: var(--ink); font-weight: 500; }

  /* ── Form panels ── */
  .ep-form { display: flex; flex-direction: column; gap: 24px; }
  
  .ep-panel-head {
    padding      : 24px 28px 20px;
    border-bottom: 1px solid var(--border);
    display      : flex;
    align-items  : center;
    gap          : 12px;
    background   : var(--surface);
  }
  .ep-panel-icon {
    width        : 36px;
    height       : 36px;
    border-radius: var(--radius-sm);
    background   : var(--brand-soft);
    display      : flex;
    align-items  : center;
    justify-content: center;
    flex-shrink  : 0;
  }
  .ep-panel-title {
    font-size    : 14px;
    font-weight  : 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color        : var(--ink);
  }
  .ep-panel-body { padding: 28px; }

  /* ── Grid ── */
  .ep-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
  .ep-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  
  @media (max-width: 640px) {
    .ep-panel-head { padding: 20px 20px 16px; }
    .ep-panel-body { padding: 20px; }
    .ep-grid-2, .ep-grid-3 { grid-template-columns: 1fr; gap: 16px; }
  }

  /* ── Inputs ── */
  .ep-field { display: flex; flex-direction: column; gap: 8px; }
  .ep-label {
    font-size    : 12px;
    font-weight  : 600;
    color        : var(--ink-2);
  }
  .ep-input {
    height       : 48px;
    background   : var(--surface);
    border       : 1px solid var(--border-2);
    border-radius: var(--radius-sm);
    padding      : 0 16px;
    font-size    : 15px;
    font-family  : var(--font-sans);
    color        : var(--ink);
    outline      : none;
    transition   : all .2s ease;
    width        : 100%;
    box-shadow   : var(--shadow-sm);
  }
  .ep-input::placeholder { color: var(--ink-4); }
  .ep-input:hover { border-color: var(--ink-4); }
  .ep-input:focus {
    border-color : var(--brand);
    box-shadow   : 0 0 0 4px var(--brand-glow);
  }
  
  .ep-select-wrap { position: relative; }
  .ep-select {
    height       : 48px;
    background   : var(--surface);
    border       : 1px solid var(--border-2);
    border-radius: var(--radius-sm);
    padding      : 0 40px 0 16px;
    font-size    : 15px;
    font-family  : var(--font-sans);
    color        : var(--ink);
    outline      : none;
    appearance   : none;
    cursor       : pointer;
    width        : 100%;
    transition   : all .2s ease;
    box-shadow   : var(--shadow-sm);
  }
  .ep-select:hover { border-color: var(--ink-4); }
  .ep-select:focus {
    border-color : var(--brand);
    box-shadow   : 0 0 0 4px var(--brand-glow);
  }
  .ep-select-arrow {
    position     : absolute;
    right        : 16px;
    top          : 50%;
    transform    : translateY(-50%);
    pointer-events: none;
    color        : var(--ink-3);
  }

  /* ── Toggles ── */
  .ep-toggle-row {
    display      : flex;
    align-items  : center;
    justify-content: space-between;
    padding      : 16px 0;
    border-bottom: 1px solid var(--surface-3);
  }
  .ep-toggle-row:last-child { border-bottom: none; padding-bottom: 0; }
  .ep-toggle-row:first-child { padding-top: 0; }
  
  .ep-toggle-info p { 
    font-size: 15px; 
    font-weight: 600; 
    color: var(--ink); 
    margin-bottom: 4px; 
  }
  .ep-toggle-info span { 
    font-size: 13px; 
    color: var(--ink-3); 
    line-height: 1.4;
    display: block;
  }
  .ep-toggle-switch { position: relative; width: 48px; height: 26px; flex-shrink: 0; }
  .ep-toggle-switch input { opacity: 0; width: 0; height: 0; position: absolute; }
  .ep-toggle-track {
    position     : absolute;
    inset        : 0;
    background   : var(--border-2);
    border-radius: 100px;
    cursor       : pointer;
    transition   : all .3s ease;
  }
  .ep-toggle-track::after {
    content      : '';
    position     : absolute;
    top          : 2px;
    left         : 2px;
    width        : 22px;
    height       : 22px;
    background   : #fff;
    border-radius: 50%;
    box-shadow   : 0 2px 4px rgba(0,0,0,0.2);
    transition   : all .3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  .ep-toggle-switch input:checked + .ep-toggle-track {
    background   : var(--brand);
  }
  .ep-toggle-switch input:checked + .ep-toggle-track::after {
    transform    : translateX(22px);
  }

  /* ── Submit button ── */
  .ep-submit-wrapper {
    margin-top: 8px;
  }
  
  .ep-submit {
    width        : 100%;
    height       : 56px;
    background   : var(--brand);
    color        : #fff;
    border       : none;
    border-radius: var(--radius-sm);
    font-family  : var(--font-sans);
    font-size    : 15px;
    font-weight  : 600;
    cursor       : pointer;
    display      : flex;
    align-items  : center;
    justify-content: center;
    gap          : 10px;
    transition   : all .2s ease;
    box-shadow   : 0 4px 12px rgba(223,0,89,0.25);
  }
  .ep-submit:hover:not(:disabled) {
    background   : var(--brand-dim);
    box-shadow   : 0 6px 16px rgba(223,0,89,0.35);
    transform    : translateY(-2px);
  }
  .ep-submit:active:not(:disabled) { 
    transform: translateY(0); 
    box-shadow: 0 2px 8px rgba(223,0,89,0.2); 
  }
  .ep-submit:disabled { 
    opacity: 0.65; 
    cursor: not-allowed; 
  }

  @media (max-width: 860px) {
    .ep-submit-wrapper {
      position: sticky;
      bottom: 24px;
      z-index: 10;
    }
    .ep-submit {
      box-shadow: 0 8px 24px rgba(223,0,89,0.3);
      border-radius: var(--radius-md);
    }
  }

  /* ── Animations ── */
  @keyframes ep-fadein {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .ep-card { animation: ep-fadein .4s cubic-bezier(0.16, 1, 0.3, 1) both; }
  .ep-main > aside { animation-delay: .0s; }
  .ep-panel:nth-child(1) { animation-delay: .1s; }
  .ep-panel:nth-child(2) { animation-delay: .15s; }
  .ep-panel:nth-child(3) { animation-delay: .2s; }
  .ep-submit-wrapper { animation: ep-fadein .4s .25s cubic-bezier(0.16, 1, 0.3, 1) both; }
`;

/* ─── Field Components ──────────────────────────────────── */
const Field = ({ label, children }) => (
  <div className="ep-field">
    <label className="ep-label">{label}</label>
    {children}
  </div>
);

const Input = ({ label, type = "text", ...props }) => (
  <Field label={label}>
    <input type={type} className="ep-input" {...props} />
  </Field>
);

const Select = ({ label, value, onChange, options, placeholder }) => (
  <Field label={label}>
    <div className="ep-select-wrap">
      <select className="ep-select" value={value} onChange={onChange}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="ep-select-arrow" />
    </div>
  </Field>
);

/* ─── Main Page ─────────────────────────────────────────── */
const EditProfilePage = () => {
  const { user, address, updateUserAndSync, saveAddress } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    avatarUrl: "",
    notificationsEnabled: true,
    marketingEmails: false,
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    if (user) {
      setForm((p) => ({
        ...p,
        name: user.name ?? "",
        phone: user.phone ?? "",
        gender: user.gender ?? "",
        dateOfBirth: user.dateOfBirth ?? "",
        avatarUrl: user.avatarUrl ?? "",
        notificationsEnabled: user.notificationsEnabled ?? true,
        marketingEmails: user.marketingEmails ?? false,
      }));
    }
    if (address) {
      setForm((p) => ({
        ...p,
        addressLine1: address.line1 ?? "",
        city: address.city ?? "",
        state: address.state ?? "",
        pincode: address.pincode ?? "",
      }));
    }
  }, [user, address]);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));
  const setCheck = (f) => (e) =>
    setForm((p) => ({ ...p, [f]: e.target.checked }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setToast({
        show: true,
        message: "Full name is required.",
        type: "error",
      });
      return;
    }
    setLoading(true);
    try {
      let finalAddressId = user.defaultAddressId;

      if (form.addressLine1 || form.city) {
        const saved = await saveAddress({
          line1: form.addressLine1,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          id: address?.id ?? null,
        });
        finalAddressId = saved.id;
      }

      const updates = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        gender: form.gender || "",
        dateOfBirth: form.dateOfBirth || "",
        avatarUrl: form.avatarUrl || "",
        notificationsEnabled: form.notificationsEnabled,
        marketingEmails: form.marketingEmails,
        defaultAddressId: finalAddressId,
      };

      await updateProfileData(user.uid, updates);
      await updateUserAndSync(updates);

      setToast({
        show: true,
        message: "Profile saved successfully.",
        type: "success",
      });
      setTimeout(() => navigate("/user/profile"), 1600);
    } catch (err) {
      setToast({
        show: true,
        message: err.message || "Something went wrong.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const avatarSrc =
    form.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.name || "U",
    )}&background=df0059&color=fff&bold=true&size=192`;

  return (
    <div className="ep-root">
      <style>{CSS}</style>

      {toast.show && (
        <NotificationProduct
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((t) => ({ ...t, show: false }))}
        />
      )}

      {/* NAV */}
      <nav className="ep-nav">
        <button
          className="ep-nav-back"
          onClick={() => navigate("/user/profile")}>
          <ArrowLeft size={18} /> Back
        </button>
        <span className="ep-nav-title">Edit Profile</span>
        <div className="ep-nav-badge">
          <span className="ep-nav-badge-dot" />
          Secure
        </div>
      </nav>

      <form onSubmit={handleSubmit}>
        <main className="ep-main">
          {/* ── SIDEBAR ── */}
          <aside>
            <div className="ep-card">
              {/* Hero */}
              <div className="ep-sidebar-hero">
                <div className="ep-avatar-wrap">
                  <img src={avatarSrc} alt="avatar" className="ep-avatar" />
                  <button type="button" className="ep-avatar-cam">
                    <Camera size={14} color="#fff" />
                  </button>
                </div>
                <div className="ep-sidebar-name">
                  {user?.name || "Your Name"}
                </div>
                <div className="ep-sidebar-email">{user?.email}</div>

                <div className="ep-pill-row">
                  <span
                    className={`ep-pill ${user?.emailVerified ? "verified" : ""}`}>
                    {user?.emailVerified ? "✓ Verified" : "Unverified"}
                  </span>
                  <span className="ep-pill provider">
                    {user?.provider || "email"}
                  </span>
                  <span className="ep-pill">{user?.role || "user"}</span>
                </div>
              </div>

              {/* Meta */}
              <div className="ep-meta-list">
                <div className="ep-meta-row">
                  <span className="ep-meta-label">Member since</span>
                  <span className="ep-meta-value">
                    {user?.createdAt?.seconds
                      ? new Date(
                          user.createdAt.seconds * 1000,
                        ).toLocaleDateString("en-IN", {
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
                <div className="ep-meta-row">
                  <span className="ep-meta-label">Last updated</span>
                  <span className="ep-meta-value">
                    {user?.updatedAt?.seconds
                      ? new Date(
                          user.updatedAt.seconds * 1000,
                        ).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })
                      : "—"}
                  </span>
                </div>
                <div className="ep-meta-row">
                  <span className="ep-meta-label">Account ID</span>
                  <span
                    className="ep-meta-value"
                    style={{ fontSize: 13, color: "var(--ink-4)" }}>
                    {user?.uid?.slice(0, 10)}…
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* ── FORM ── */}
          <div className="ep-form">
            {/* Personal */}
            <Panel
              icon={<User size={18} color="var(--brand)" />}
              title="Personal Details">
              <div className="ep-grid-2">
                <Input
                  label="Full Name *"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Your full name"
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="10-digit number"
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={set("dateOfBirth")}
                />
                <Select
                  label="Gender"
                  value={form.gender}
                  onChange={set("gender")}
                  placeholder="Select gender"
                  options={[
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                    { value: "Other", label: "Other" },
                  ]}
                />
              </div>
            </Panel>

            {/* Address */}
            <Panel
              icon={<MapPin size={18} color="var(--brand)" />}
              title="Default Address">
              <div
                style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <Input
                  label="Street Address"
                  value={form.addressLine1}
                  onChange={set("addressLine1")}
                  placeholder="House no., building, street area"
                />
                <div className="ep-grid-3">
                  <Input
                    label="City"
                    value={form.city}
                    onChange={set("city")}
                    placeholder="E.g. Nainital"
                  />
                  <Input
                    label="State"
                    value={form.state}
                    onChange={set("state")}
                    placeholder="E.g. Uttarakhand"
                  />
                  <Input
                    label="Pincode"
                    value={form.pincode}
                    onChange={set("pincode")}
                    placeholder="000000"
                  />
                </div>
              </div>
            </Panel>

            {/* Preferences */}
            <Panel
              icon={<Bell size={18} color="var(--brand)" />}
              title="Preferences">
              <Toggle
                label="Push Notifications"
                description="Get updates on your deliveries, messages, and account activity."
                checked={form.notificationsEnabled}
                onChange={setCheck("notificationsEnabled")}
              />
              <Toggle
                label="Marketing Emails"
                description="Receive exclusive deals, new arrivals, and special promotional offers."
                checked={form.marketingEmails}
                onChange={setCheck("marketingEmails")}
              />
            </Panel>

            {/* Submit */}
            <div className="ep-submit-wrapper">
              <button type="submit" className="ep-submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2
                      size={20}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                    Saving changes...
                  </>
                ) : (
                  <>
                    <Check size={20} /> Save Profile Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </main>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default EditProfilePage;
