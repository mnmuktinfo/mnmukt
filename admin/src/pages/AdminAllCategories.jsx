import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../config/firebase";
// Standard utilitarian icons
import {
  FaPlus,
  FaSync,
  FaSearch,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaStar,
  FaFolderOpen,
  FaCalendarAlt,
} from "react-icons/fa";
import AdminNavbar from "../components/bars/AdminNavbar";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "categories"),
        orderBy("createdAt", "desc"),
      );
      const snapshot = await getDocs(q);
      setCategories(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );
    } catch (error) {
      console.error("Registry Sync Failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleToggleStatus = async (id, current) => {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, "categories", id), { isActive: !current });
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive: !current } : c)),
      );
    } catch (err) {
      alert("Update failed");
    }
    setActionLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanent delete? This cannot be undone.")) return;
    setActionLoading(true);
    try {
      await deleteDoc(doc(db, "categories", id));
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert("Delete failed");
    }
    setActionLoading(false);
  };

  const filtered = useMemo(() => {
    return categories.filter((c) => {
      const matchesSearch = c.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? c.isActive : !c.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [categories, searchTerm, statusFilter]);

  if (loading)
    return (
      <div className="p-20 text-center text-gray-400 text-sm animate-pulse">
        Syncing Database...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-10 px-6 font-sans text-gray-800">
      <main className="max-w-[1400px] mx-auto">
        {/* TOP BAR: ACTIONS */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Category Registry
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Total {categories.length} records identified
            </p>
          </div>

          <button
            onClick={() => navigate("/categories/create")}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded shadow-sm transition-all active:scale-95">
            <FaPlus size={12} /> New Collection
          </button>
        </div>

        {/* SEARCH & FILTER HUD */}
        <div className="bg-white border border-gray-200 p-3 mb-4 rounded flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search category name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 py-2 pl-9 pr-4 text-sm focus:bg-white focus:border-blue-500 outline-none transition-all rounded"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 py-2 px-4 text-sm rounded outline-none w-full md:w-40">
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <button
            onClick={fetchCategories}
            className="p-2.5 text-gray-500 hover:text-blue-600 bg-gray-50 border border-gray-200 rounded active:scale-90">
            <FaSync size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* COMPACT DATA TABLE */}
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[11px] font-bold uppercase text-gray-500 border-b border-gray-200">
                  <th className="px-6 py-4">Preview</th>
                  <th className="px-6 py-4">Collection Name</th>
                  <th className="px-6 py-4">Visibility</th>
                  <th className="px-6 py-4">Stats</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="w-10 h-10 bg-gray-100 border border-gray-200 rounded overflow-hidden">
                        <img
                          src={c.image}
                          className="w-full h-full object-cover"
                          alt=""
                          onError={(e) =>
                            (e.target.src = "https://placehold.co/40?text=NA")
                          }
                        />
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <p className="text-sm font-bold text-gray-900">
                        {c.name}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                        <FaCalendarAlt />{" "}
                        {c.createdAt?.toDate().toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <StatusLabel active={c.isActive} />
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {c.productCount || 0} items
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          icon={<FaEdit />}
                          onClick={() => navigate(`/categories/edit/${c.id}`)}
                          title="Edit"
                        />
                        <IconButton
                          icon={c.isActive ? <FaEyeSlash /> : <FaEye />}
                          onClick={() => handleToggleStatus(c.id, c.isActive)}
                          loading={actionLoading}
                          title={c.isActive ? "Deactivate" : "Activate"}
                        />
                        <IconButton
                          icon={<FaTrash />}
                          onClick={() => handleDelete(c.id)}
                          color="red"
                          title="Delete"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-20 text-center text-gray-400 text-sm italic">
              No records found matching your filters.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

/* --- UTILITY COMPONENTS --- */

const StatusLabel = ({ active }) => (
  <span
    className={`text-[10px] font-bold px-2 py-1 rounded border uppercase ${
      active
        ? "bg-green-50 text-green-700 border-green-200"
        : "bg-red-50 text-red-700 border-red-200"
    }`}>
    {active ? "Active" : "Inactive"}
  </span>
);

const IconButton = ({ icon, onClick, color = "blue", loading, title }) => (
  <button
    onClick={onClick}
    disabled={loading}
    title={title}
    className={`p-2 rounded hover:bg-gray-100 transition-all active:scale-90
    ${color === "red" ? "text-gray-400 hover:text-red-600" : "text-gray-400 hover:text-blue-600"}`}>
    {icon}
  </button>
);

export default AdminCategories;
