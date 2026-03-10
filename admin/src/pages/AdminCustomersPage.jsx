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
  deleteDoc,
} from "firebase/firestore";
// Switched to simpler, standard React Icons
import {
  FaSearch,
  FaSync,
  FaTrash,
  FaBan,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaHistory,
  FaUserAlt,
  FaLockOpen,
  FaLock,
  FaCopy,
  FaArrowLeft,
  FaChevronRight,
  FaPlusCircle,
} from "react-icons/fa";

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
      alert("Action Failed");
    }
    setActionLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard");
  };

  const filteredList = customers.filter(
    (c) =>
      !searchTerm ||
      c.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex-1 flex h-screen bg-[#f3f4f6] font-sans text-gray-800 overflow-hidden ">
      {/* LEFT SIDE: LIST VIEW */}
      <div
        className={`flex flex-col border-r border-gray-200 w-full md:w-[350px] bg-white ${selectedCustomer ? "hidden md:flex" : "flex"}`}>
        <div className="h-14 px-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <h2 className="font-bold text-gray-700">All Customers</h2>
          <button
            onClick={() => fetchCustomers(false)}
            className={`p-2 text-gray-400 hover:text-blue-600 ${refreshing ? "animate-spin" : ""}`}>
            <FaSync size={14} />
          </button>
        </div>

        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {loading ? (
            <p className="p-10 text-center text-xs text-gray-400 italic">
              Syncing Registry...
            </p>
          ) : (
            <div>
              {filteredList.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCustomer(c)}
                  className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 flex items-center gap-3 transition-all ${selectedCustomer?.id === c.id ? "bg-blue-50 border-r-4 border-r-blue-600" : ""}`}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${c.isBlocked ? "bg-red-400" : "bg-gray-400"}`}>
                    {c.displayName?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {c.displayName || "No Name"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{c.email}</p>
                  </div>
                  {c.isBlocked && <FaBan size={10} className="text-red-500" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE: DETAIL VIEW */}
      <div
        className={`flex-1 flex flex-col bg-gray-50 ${!selectedCustomer ? "hidden md:flex items-center justify-center" : "flex"}`}>
        {selectedCustomer ? (
          <>
            {/* Action Bar */}
            <div className="h-14 px-6 bg-white border-b border-gray-200 flex items-center justify-between sticky top-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="md:hidden text-gray-400">
                  <FaArrowLeft />
                </button>
                <h3 className="font-bold text-gray-700">Customer Profile</h3>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleToggleBlock}
                  disabled={actionLoading}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold transition-all active:scale-95 ${selectedCustomer.isBlocked ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
                  {selectedCustomer.isBlocked ? (
                    <>
                      <FaLockOpen /> Enable User
                    </>
                  ) : (
                    <>
                      <FaLock /> Disable User
                    </>
                  )}
                </button>
                <button className="p-2 bg-white border border-gray-200 rounded text-gray-400 hover:text-red-600 active:scale-90 transition-all">
                  <FaTrash />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Header Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center gap-6">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                    <FaUserAlt size={32} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedCustomer.displayName || "Unnamed Customer"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                      Registry UID:{" "}
                      <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {selectedCustomer.id}
                      </span>
                      <FaCopy
                        className="cursor-pointer hover:text-blue-600"
                        onClick={() => copyToClipboard(selectedCustomer.id)}
                      />
                    </p>
                    <div className="mt-3 flex gap-2">
                      <span
                        className={`text-[10px] font-bold px-3 py-1 rounded-full ${selectedCustomer.isBlocked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                        {selectedCustomer.isBlocked
                          ? "BLOCKED"
                          : "ACTIVE ACCOUNT"}
                      </span>
                      {selectedCustomer.emailVerified && (
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <FaEnvelope /> EMAIL VERIFIED
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contact Info */}
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                      <FaEnvelope /> Contact Details
                    </h4>
                    <div className="space-y-4">
                      <DetailRow
                        label="Email Address"
                        value={selectedCustomer.email}
                        isLink
                        link={`mailto:${selectedCustomer.email}`}
                      />
                      <DetailRow
                        label="Phone Number"
                        value={selectedCustomer.phoneNumber || "Not provided"}
                      />
                      <DetailRow
                        label="Shipping Address"
                        value={selectedCustomer.address || "No saved address"}
                      />
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                      <FaHistory /> Activity Summary
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                          Orders
                        </p>
                        <p className="text-xl font-black text-gray-800">
                          {selectedCustomer.ordersCount || 0}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                          Spent
                        </p>
                        <p className="text-xl font-black text-gray-800">
                          ₹{selectedCustomer.totalSpent || 0}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 p-4 border border-gray-100 rounded flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-medium">
                        Customer Since
                      </span>
                      <span className="font-bold text-gray-700">
                        {new Date(
                          selectedCustomer.createdAt,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Table Simplified */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-100 font-bold text-sm bg-gray-50/50">
                    Recent Order History
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs text-gray-400 font-bold uppercase bg-white border-b border-gray-50">
                      <tr>
                        <th className="px-6 py-3">Order ID</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono text-xs">#90321</td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-bold text-green-600 px-2 py-0.5 bg-green-50 rounded">
                            Shipped
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold">
                          ₹1,299
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  {!selectedCustomer.ordersCount && (
                    <p className="p-10 text-center text-xs text-gray-400 italic">
                      No transactions found for this identity.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-400 flex flex-col items-center">
            <FaUserAlt size={40} className="mb-4 opacity-20" />
            <p className="text-sm font-medium">Select a user to view records</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* --- MINI HELPER --- */
const DetailRow = ({ label, value, isLink, link }) => (
  <div className="border-b border-gray-50 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
      {label}
    </p>
    {isLink ? (
      <a
        href={link}
        className="text-sm font-bold text-blue-600 hover:underline break-all">
        {value}
      </a>
    ) : (
      <p className="text-sm font-bold text-gray-800">{value}</p>
    )}
  </div>
);

export default AdminCustomers;
