import React, { useEffect, useState, useMemo } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";

// Import our new split components
import AdminGuide from "../../components/allcustomers/AdminGuide";
import CustomerModal from "../../components/allcustomers/CustomerModal";

const PAGE_SIZE = 25;

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [selected, setSelected] = useState(null);

  const usersRef = collection(db, "users");

  async function loadCustomers() {
    setLoading(true);
    const q = query(usersRef, orderBy("createdAt", "desc"), limit(PAGE_SIZE));
    const snap = await getDocs(q);
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    setCustomers(docs);
    if (snap.docs.length) setLastDoc(snap.docs[snap.docs.length - 1]);
    setLoading(false);
  }

  async function loadMore() {
    if (!lastDoc) return;
    setLoading(true);

    const q = query(
      usersRef,
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(PAGE_SIZE),
    );
    const snap = await getDocs(q);
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    setCustomers((prev) => [...prev, ...docs]);
    if (snap.docs.length) setLastDoc(snap.docs[snap.docs.length - 1]);
    setLoading(false);
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  async function deleteCustomer(id) {
    if (!window.confirm("Are you sure you want to delete this customer?"))
      return;
    await deleteDoc(doc(db, "users", id));
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  }

  // This is passed down to the modal
  async function saveCustomer(updatedCustomerData) {
    await updateDoc(doc(db, "users", updatedCustomerData.id), {
      displayName: updatedCustomerData.displayName,
      email: updatedCustomerData.email,
      phone: updatedCustomerData.phone,
    });
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === updatedCustomerData.id ? updatedCustomerData : c,
      ),
    );
  }

  const filtered = useMemo(() => {
    if (!search) return customers;
    const s = search.toLowerCase();
    return customers.filter(
      (c) =>
        (c.displayName || "").toLowerCase().includes(s) ||
        (c.email || "").toLowerCase().includes(s) ||
        (c.phone || "").includes(s),
    );
  }, [customers, search]);

  const isInitialLoading = loading && customers.length === 0;

  const SkeletonRow = () => (
    <tr className="border-b border-gray-200 animate-pulse">
      <td className="px-6 py-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 w-32 rounded"></div>
          <div className="h-3 bg-gray-200 w-20 rounded"></div>
        </div>
      </td>
      <td className="px-6 py-4 hidden sm:table-cell">
        <div className="h-4 bg-gray-200 w-40 rounded"></div>
      </td>
      <td className="px-6 py-4 hidden md:table-cell">
        <div className="h-4 bg-gray-200 w-24 rounded"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 bg-gray-200 w-16 rounded-full"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 w-12 rounded ml-auto"></div>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-gray-900 pb-12 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Render the new Admin Guide */}
        <AdminGuide />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Customers
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and view your customer database
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
          {/* Search Input */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Desktop Table */}
          <div className="overflow-x-auto hidden sm:block">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f9fafb] border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isInitialLoading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-gray-500">
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-200 shrink-0">
                            <span className="text-sm font-bold text-blue-700">
                              {c.displayName?.charAt(0)?.toUpperCase() || "?"}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {c.displayName || "Unknown"}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {c.id.slice(0, 8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {c.email || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {c.phone || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <button
                          onClick={() => setSelected(c)}
                          className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 shadow-sm">
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCustomer(c.id)}
                          className="px-3 py-1.5 text-sm text-red-600 bg-white border border-gray-300 rounded hover:bg-red-50 shadow-sm">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards (Simplified for brevity) */}
          <div className="sm:hidden divide-y divide-gray-200">
            {filtered.map((c) => (
              <div key={c.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between mb-3">
                  <div className="font-semibold text-sm">{c.displayName}</div>
                </div>
                <div className="text-sm text-gray-600 mb-2">{c.phone}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelected(c)}
                    className="flex-1 border rounded py-1">
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCustomer(c.id)}
                    className="flex-1 border border-red-200 text-red-600 rounded py-1">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {customers.length >= PAGE_SIZE && !isInitialLoading && (
          <div className="text-center mt-6">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-6 py-2.5 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50">
              {loading ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </div>

      {/* Render the separate Modal Component */}
      <CustomerModal
        isOpen={!!selected}
        customer={selected}
        onClose={() => setSelected(null)}
        onSave={saveCustomer}
      />
    </div>
  );
}
