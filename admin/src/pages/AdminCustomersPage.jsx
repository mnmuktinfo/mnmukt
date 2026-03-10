import React, { useState, useEffect } from "react";
import { db } from "../config/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  Search,
  RefreshCw,
  Ban,
  Mail,
  Phone,
  MapPin,
  Clock,
  User,
  Lock,
  Unlock,
  Copy,
  ArrowLeft,
  Info,
  ShieldAlert,
  CheckCircle2,
  ShoppingBag,
  ExternalLink,
  Users,
  Loader2,
} from "lucide-react";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCustomers = async (isNext = false) => {
    if (isNext && (!lastDoc || !hasMore)) return;
    if (!isNext) setLoading(true);

    try {
      const customersRef = collection(db, "users");
      let q = query(customersRef, orderBy("createdAt", "desc"), limit(15));

      if (isNext && lastDoc) {
        q = query(
          customersRef,
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(15),
        );
      }

      const snapshot = await getDocs(q);
      const newDocs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCustomers((prev) => (isNext ? [...prev, ...newDocs] : newDocs));
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      if (snapshot.docs.length < 15) setHasMore(false);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleBlock = async () => {
    if (!selectedCustomer) return;

    const actionName = selectedCustomer.isBlocked ? "REACTIVATE" : "SUSPEND";
    if (
      !window.confirm(
        `Are you sure you want to ${actionName} this customer's account?`,
      )
    )
      return;

    setActionLoading(true);
    const newStatus = !selectedCustomer.isBlocked;

    try {
      await updateDoc(doc(db, "users", selectedCustomer.id), {
        isBlocked: newStatus,
      });
      const updated = { ...selectedCustomer, isBlocked: newStatus };
      setCustomers((prev) =>
        prev.map((c) => (c.id === selectedCustomer.id ? updated : c)),
      );
      setSelectedCustomer(updated);
    } catch (err) {
      alert(
        "Failed to update customer status. Please check your internet connection.",
      );
    }
    setActionLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Customer ID copied to clipboard!");
  };

  const filteredList = customers.filter(
    (c) =>
      !searchTerm ||
      c.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex h-[100dvh] bg-[#f1f3f6] font-sans text-[#212121] overflow-hidden pt-14 lg:pt-0">
      {/* ─── LEFT SIDE: CUSTOMER DIRECTORY (List) ─── */}
      <div
        className={`flex flex-col border-r border-gray-300 w-full md:w-[350px] bg-white z-10 shrink-0 ${selectedCustomer ? "hidden md:flex" : "flex"}`}>
        {/* Header */}
        <div className="h-14 px-4 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-800">
            Customer Directory
          </h2>
          <button
            onClick={() => {
              setRefreshing(true);
              fetchCustomers(false);
            }}
            className={`p-2 text-gray-500 hover:text-[#2874F0] rounded transition-colors ${refreshing ? "animate-spin text-[#2874F0]" : ""}`}
            title="Refresh List">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-gray-200 bg-[#f1f3f6]/50">
          <div className="relative bg-white border border-gray-300 rounded-sm overflow-hidden flex items-center focus-within:border-[#2874F0] focus-within:shadow-[0_0_0_1px_#2874F0] transition-all">
            <Search className="ml-3 text-gray-400 shrink-0" size={16} />
            <input
              type="text"
              placeholder="Search name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm outline-none bg-transparent placeholder:text-[#878787]"
            />
          </div>
        </div>

        {/* Customer List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center text-[#878787]">
              <Loader2 className="animate-spin mb-3 text-[#2874F0]" size={24} />
              <p className="text-xs font-bold uppercase tracking-widest">
                Loading Data...
              </p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="p-8 text-center text-[#878787]">
              <User size={32} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">No customers found.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredList.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCustomer(c)}
                  className={`p-4 cursor-pointer flex items-center gap-3 transition-colors ${
                    selectedCustomer?.id === c.id
                      ? "bg-[#f4f8ff] border-l-4 border-l-[#2874F0]"
                      : "hover:bg-gray-50 border-l-4 border-l-transparent"
                  }`}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                      c.isBlocked ? "bg-[#ff6161]" : "bg-[#2874F0]"
                    }`}>
                    {c.displayName?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold truncate ${selectedCustomer?.id === c.id ? "text-[#2874F0]" : "text-[#212121]"}`}>
                      {c.displayName || "No Name Provided"}
                    </p>
                    <p className="text-xs text-[#878787] truncate mt-0.5">
                      {c.email}
                    </p>
                  </div>
                  {c.isBlocked && (
                    <div className="text-[#ff6161]" title="Account Suspended">
                      <Ban size={14} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── RIGHT SIDE: CUSTOMER DETAILS (Flipkart Style) ─── */}
      <div
        className={`flex-1 flex flex-col bg-[#f1f3f6] ${!selectedCustomer ? "hidden md:flex" : "flex"}`}>
        {!selectedCustomer ? (
          // EMPTY STATE (Guidance)
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="bg-white border border-gray-200 p-8 rounded-sm shadow-sm max-w-md w-full">
              <h2 className="text-lg font-bold text-[#212121] mb-2 flex items-center gap-2">
                <Users className="text-[#2874F0]" size={20} /> Customer Overview
              </h2>
              <p className="text-[#878787] text-sm mb-6 leading-relaxed">
                Select a customer from the left panel to view their complete
                profile, order history, and account status.
              </p>

              <div className="bg-[#fff9e6] border border-[#f7e6a1] p-4 rounded-sm text-left">
                <h4 className="text-xs font-bold text-[#856404] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Info size={14} /> Merchant Tips
                </h4>
                <ul className="text-xs text-[#856404] space-y-2 list-disc list-inside ml-1">
                  <li>
                    <strong>Search:</strong> Easily find users by their
                    registered email.
                  </li>
                  <li>
                    <strong>Suspend Users:</strong> Block accounts that place
                    fake COD orders or spam.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          // SELECTED CUSTOMER DETAILS
          <>
            {/* Mobile Header */}
            <div className="md:hidden h-14 px-4 bg-[#2874F0] text-white flex items-center gap-3 shrink-0 sticky top-0 z-20 shadow-md">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 hover:bg-white/20 rounded">
                <ArrowLeft size={20} />
              </button>
              <h3 className="font-bold text-sm uppercase tracking-wide">
                Customer Details
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
              <div className="max-w-4xl mx-auto space-y-4">
                {/* Top Profile Card */}
                <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl shrink-0 ${
                        selectedCustomer.isBlocked
                          ? "bg-[#ff6161]"
                          : "bg-[#2874F0]"
                      }`}>
                      {selectedCustomer.displayName?.charAt(0).toUpperCase() ||
                        "?"}
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-[#212121] leading-none mb-1.5">
                        {selectedCustomer.displayName || "Unknown Customer"}
                      </h2>
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${
                            selectedCustomer.isBlocked
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}>
                          {selectedCustomer.isBlocked
                            ? "Account Suspended"
                            : "Active Account"}
                        </span>
                        {selectedCustomer.emailVerified && (
                          <span className="text-[10px] font-bold text-[#2874F0] bg-blue-50 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                            Verified Email
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#878787]">
                        <span>
                          User ID:{" "}
                          <span className="font-mono text-[#212121]">
                            {selectedCustomer.id}
                          </span>
                        </span>
                        <button
                          onClick={() => copyToClipboard(selectedCustomer.id)}
                          className="text-[#2874F0] hover:underline flex items-center gap-1">
                          <Copy size={12} /> Copy
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Account Action Button */}
                  <div className="w-full md:w-auto md:min-w-[200px] bg-gray-50 border border-gray-200 p-4 rounded-sm flex flex-col items-center text-center">
                    <p className="text-[10px] font-bold text-[#878787] uppercase tracking-wider mb-2">
                      Account Access
                    </p>
                    <button
                      onClick={handleToggleBlock}
                      disabled={actionLoading}
                      className={`w-full py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 ${
                        selectedCustomer.isBlocked
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-white border border-gray-300 text-[#ff6161] hover:bg-red-50 hover:border-red-200"
                      }`}>
                      {actionLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : selectedCustomer.isBlocked ? (
                        <>
                          <Unlock size={14} /> Reactivate
                        </>
                      ) : (
                        <>
                          <Ban size={14} /> Suspend User
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Contact Information Box */}
                  <div className="bg-white rounded-sm shadow-sm border border-gray-200 flex flex-col">
                    <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                      <h3 className="text-sm font-bold text-[#212121] uppercase tracking-wide flex items-center gap-2">
                        <User size={16} className="text-[#878787]" /> Personal
                        Details
                      </h3>
                    </div>
                    <div className="p-5 space-y-4 flex-1">
                      <DetailRow
                        label="Email Address"
                        value={selectedCustomer.email}
                        isLink
                        link={`mailto:${selectedCustomer.email}`}
                      />
                      <DetailRow
                        label="Phone Number"
                        value={selectedCustomer.phoneNumber || "Not Provided"}
                      />
                      <DetailRow
                        label="Shipping Address"
                        value={selectedCustomer.address || "No Address Saved"}
                      />
                      <DetailRow
                        label="Account Created On"
                        value={
                          selectedCustomer.createdAt
                            ? new Date(
                                selectedCustomer.createdAt,
                              ).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "Unknown"
                        }
                      />
                    </div>
                  </div>

                  {/* Order History Box */}
                  <div className="bg-white rounded-sm shadow-sm border border-gray-200 flex flex-col">
                    <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                      <h3 className="text-sm font-bold text-[#212121] uppercase tracking-wide flex items-center gap-2">
                        <ShoppingBag size={16} className="text-[#878787]" />{" "}
                        Purchase Summary
                      </h3>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex gap-4 mb-6">
                        <div className="flex-1 bg-[#f4f8ff] border border-blue-100 p-4 rounded-sm">
                          <p className="text-[10px] font-bold text-[#878787] uppercase tracking-wider mb-1">
                            Total Orders
                          </p>
                          <p className="text-2xl font-black text-[#2874F0]">
                            {selectedCustomer.ordersCount || 0}
                          </p>
                        </div>
                        <div className="flex-1 bg-[#f4f8ff] border border-blue-100 p-4 rounded-sm">
                          <p className="text-[10px] font-bold text-[#878787] uppercase tracking-wider mb-1">
                            Total Spent
                          </p>
                          <p className="text-2xl font-black text-[#212121]">
                            ₹{selectedCustomer.totalSpent || 0}
                          </p>
                        </div>
                      </div>

                      <div className="mt-auto bg-gray-50 border border-gray-200 p-4 rounded-sm flex items-start gap-3">
                        <ShieldAlert
                          size={18}
                          className="text-[#878787] shrink-0 mt-0.5"
                        />
                        <div>
                          <p className="text-xs text-[#212121] font-semibold mb-1">
                            Order Management
                          </p>
                          <p className="text-[11px] text-[#878787] leading-relaxed">
                            To view individual items bought, tracking details,
                            or to process refunds for this customer, search
                            their name in the main <strong>Orders</strong>{" "}
                            section.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* --- UTILITY COMPONENT FOR DATA ROWS --- */
const DetailRow = ({ label, value, isLink, link }) => {
  const isMissing =
    value === "Not Provided" ||
    value === "No Address Saved" ||
    value === "Unknown";

  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-bold text-[#878787] uppercase tracking-wider mb-0.5">
        {label}
      </span>
      {isLink ? (
        <a
          href={link}
          className="text-sm font-semibold text-[#2874F0] hover:underline flex items-center gap-1 w-fit">
          {value} <ExternalLink size={12} />
        </a>
      ) : (
        <span
          className={`text-sm ${isMissing ? "text-[#878787] italic" : "text-[#212121] font-medium"}`}>
          {value}
        </span>
      )}
    </div>
  );
};

export default AdminCustomers;
