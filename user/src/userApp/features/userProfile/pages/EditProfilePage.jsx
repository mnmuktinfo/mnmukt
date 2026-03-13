import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/UserContext";
import { editUserProfile } from "../services/userService";
import {
  ArrowLeft,
  Loader2,
  Camera,
  Globe,
  User as UserIcon,
  CheckCircle2,
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
      if (!form.name.trim()) throw new Error("Please enter your name");
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
        message: "Profile updated successfully!",
        type: "success",
      });
      setTimeout(() => navigate("/user/profile"), 1500);
    } catch (err) {
      setToast({
        show: true,
        message: err.message || "Something went wrong",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans pb-20">
      {toast.show && (
        <NotificationProduct
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* CLEAN HEADER */}
      <nav className="bg-white border-b border-gray-200 px-4 sm:px-8 h-16 flex items-center justify-between sticky top-0 z-50">
        <button
          onClick={() => navigate("/user/profile")}
          className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-tight text-gray-600 hover:text-[#007673] transition-colors">
          <ArrowLeft size={18} />
          Back
        </button>
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#007673]" />
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
            Secure Profile Edit
          </span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* LEFT: Profile Picture Section */}
          <aside className="md:w-1/3 flex flex-col items-center">
            <div className="bg-white p-6 rounded-sm border border-gray-200 w-full flex flex-col items-center shadow-sm">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full border-4 border-gray-50 overflow-hidden shadow-sm">
                  <img
                    src={
                      user?.photoURL ||
                      `https://ui-avatars.com/api/?name=${user?.name}&background=007673&color=fff`
                    }
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute bottom-0 right-0 bg-[#007673] text-white p-2 rounded-full shadow-lg hover:bg-[#005f5c] transition-colors border-2 border-white">
                  <Camera size={14} />
                </button>
              </div>
              <h2 className="mt-4 font-bold text-gray-800">{user?.name}</h2>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </aside>

          {/* RIGHT: Form Section */}
          <form onSubmit={handleSubmit} className="flex-1 space-y-6">
            {/* PERSONAL SECTION */}
            <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
                <UserIcon size={18} className="text-[#007673]" />
                <h3 className="text-[12px] font-bold text-gray-800 uppercase tracking-wider">
                  Personal Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <ShopifyInput
                  label="Full Name"
                  name="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter your name"
                />
                <ShopifyInput
                  label="Date of Birth"
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={(e) =>
                    setForm({ ...form, dateOfBirth: e.target.value })
                  }
                />

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                    Gender
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) =>
                      setForm({ ...form, gender: e.target.value })
                    }
                    className="w-full h-11 bg-gray-50 border border-gray-200 rounded-sm px-3 text-sm focus:ring-1 focus:ring-[#007673] focus:border-[#007673] outline-none transition-all">
                    <option value="" disabled>
                      Select Gender
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ADDRESS SECTION */}
            <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
                <Globe size={18} className="text-[#007673]" />
                <h3 className="text-[12px] font-bold text-gray-800 uppercase tracking-wider">
                  Default Address
                </h3>
              </div>

              <div className="space-y-5">
                <ShopifyInput
                  label="Street Address"
                  name="addressLine1"
                  value={form.addressLine1}
                  onChange={(e) =>
                    setForm({ ...form, addressLine1: e.target.value })
                  }
                  placeholder="House No, Building, Street"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <ShopifyInput
                    label="City"
                    name="city"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                  <ShopifyInput
                    label="State"
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

            {/* BUTTON */}
            <button
              disabled={loading}
              className="w-full bg-[#007673] text-white py-4 text-[13px] font-bold uppercase tracking-widest rounded-sm hover:bg-[#005f5c] transition-all disabled:opacity-50 shadow-md flex items-center justify-center gap-2">
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                "Save Changes"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

const ShopifyInput = ({ label, type = "text", ...props }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
      {label}
    </label>
    <input
      type={type}
      {...props}
      className="w-full h-11 bg-gray-50 border border-gray-200 rounded-sm px-4 text-sm font-medium text-gray-800 focus:bg-white focus:ring-1 focus:ring-[#007673] focus:border-[#007673] outline-none transition-all placeholder:text-gray-300"
    />
  </div>
);

export default EditProfilePage;
