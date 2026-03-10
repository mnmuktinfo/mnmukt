import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/UserContext";
import { editUserProfile } from "../services/userService";
import {
  ArrowLeft,
  Loader2,
  Camera,
  ShieldCheck,
  ChevronRight,
  Globe,
  User as UserIcon,
} from "lucide-react";
import NotificationProduct from "../../../components/cards/NotificationProduct";

const EditProfilePage = () => {
  const { user, address, updateUserAndSync, saveAddress } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    gender: "",
    dateOfBirth: "",
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
    if (user)
      setForm((prev) => ({
        ...prev,
        name: user.name || "",
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth || "",
      }));
    if (address)
      setForm((prev) => ({
        ...prev,
        addressLine1: address.line1 || "",
        city: address.city || "",
        state: address.state || "",
        pincode: address.pincode || "",
      }));
  }, [user, address]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!form.name.trim()) throw new Error("Full identity required");
      let finalAddressId = user.defaultAddressId;
      if (form.addressLine1 || form.city) {
        const savedAddr = await saveAddress({
          line1: form.addressLine1,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          id: address?.id || null,
        });
        finalAddressId = savedAddr.id;
      }
      const updates = {
        name: form.name.trim(),
        gender: form.gender || null,
        dateOfBirth: form.dateOfBirth || null,
        defaultAddressId: finalAddressId,
      };
      await editUserProfile(user.uid, updates);
      await updateUserAndSync(updates);
      setToast({
        show: true,
        message: "Manifest Updated Successfully",
        type: "success",
      });
      setTimeout(() => navigate("/user/profile"), 1500);
    } catch (err) {
      setToast({
        show: true,
        message: err.message || "Protocol Failure",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] font-sans">
      {toast.show && (
        <NotificationProduct
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* 1. LUXURY MINIMAL NAV */}
      <nav className="bg-white border-b border-gray-100 px-8 h-20 flex items-center justify-between sticky top-0 z-50">
        <button
          onClick={() => navigate("/user/profile")}
          className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 hover:text-black transition-all">
          <ArrowLeft size={16} strokeWidth={1} />
          Return to Profile
        </button>
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#ff356c]" />
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">
            Auth Session Active
          </span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* LEFT: Identity Sidebar */}
          <aside className="lg:w-1/3 space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-light tracking-tighter text-gray-900 leading-none">
                Edit <br />{" "}
                <span className="italic font-serif text-[#ff356c]">
                  Personal.
                </span>
              </h1>
            </div>

            <div className="relative inline-block group">
              <div className="w-32 h-32 rounded-full border border-gray-100 p-2 bg-white shadow-sm transition-transform duration-500 group-hover:scale-[1.02]">
                <img
                  src={
                    user?.photoURL ||
                    `https://ui-avatars.com/api/?name=${user?.name}&background=f3f4f6&color=9ca3af`
                  }
                  alt="Identity"
                  className="w-full h-full rounded-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all"
                />
              </div>
              <button className="absolute bottom-1 right-1 bg-black text-white p-2.5 rounded-full shadow-xl hover:bg-[#ff356c] transition-colors border-4 border-white">
                <Camera size={14} />
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                Email Address
              </p>
              <p className="text-sm font-medium text-gray-600">{user?.email}</p>
            </div>
          </aside>

          {/* RIGHT: Specification Form */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 space-y-12 bg-white p-10 rounded-sm border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.03)]">
            {/* PERSONAL SECTION */}
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <UserIcon size={16} className="text-gray-300" />
                <h3 className="text-[11px] font-black text-gray-950 uppercase tracking-[0.3em]">
                  Personal Specification
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ShopifyInput
                  label="Legal Name"
                  name="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <ShopifyInput
                  label="Birth Date"
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={(e) =>
                    setForm({ ...form, dateOfBirth: e.target.value })
                  }
                />

                <div className="flex flex-col gap-3 group">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-focus-within:text-[#ff356c] transition-colors">
                    Gender Identification
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) =>
                      setForm({ ...form, gender: e.target.value })
                    }
                    className="w-full h-12 bg-gray-50 border-transparent border-b-2 border-b-gray-100 focus:border-b-[#ff356c] focus:bg-white outline-none text-xs font-bold transition-all px-4">
                    <option value="" disabled>
                      Select Orientation
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* LOGISTICS SECTION */}
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <Globe size={16} className="text-gray-300" />
                <h3 className="text-[11px] font-black text-gray-950 uppercase tracking-[0.3em]">
                  Logistics Coordinates
                </h3>
              </div>

              <div className="space-y-8">
                <ShopifyInput
                  label="Street Residence"
                  name="addressLine1"
                  value={form.addressLine1}
                  onChange={(e) =>
                    setForm({ ...form, addressLine1: e.target.value })
                  }
                  placeholder="Apartment, suite, or unit number"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <ShopifyInput
                    label="City"
                    name="city"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                  <ShopifyInput
                    label="Region / State"
                    name="state"
                    value={form.state}
                    onChange={(e) =>
                      setForm({ ...form, state: e.target.value })
                    }
                  />
                  <ShopifyInput
                    label="Pincode"
                    name="pincode"
                    value={form.pincode}
                    onChange={(e) =>
                      setForm({ ...form, pincode: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* FINAL ACTION */}
            <div className="pt-8 border-t border-gray-50 flex flex-col items-center gap-6">
              <button
                disabled={loading}
                className="w-full bg-black text-white py-6 text-[11px] font-black uppercase tracking-[0.5em] hover:bg-[#ff356c] transition-all duration-700 disabled:opacity-30 shadow-2xl flex items-center justify-center gap-4">
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Authorize Manifest"
                )}
              </button>
              <p className="text-[9px] text-gray-300 uppercase tracking-widest">
                Protocol: Secure Data-Tunnel Active (AES-256)
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

const ShopifyInput = ({ label, type = "text", ...props }) => (
  <div className="flex flex-col gap-3 group">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-focus-within:text-[#ff356c] transition-colors">
      {label}
    </label>
    <input
      type={type}
      {...props}
      className="w-full h-12 bg-gray-50 border-transparent border-b-2 border-b-gray-100 focus:border-b-[#ff356c] focus:bg-white outline-none text-[13px] font-medium text-gray-950 transition-all px-4 placeholder:text-gray-200"
    />
  </div>
);

export default EditProfilePage;
