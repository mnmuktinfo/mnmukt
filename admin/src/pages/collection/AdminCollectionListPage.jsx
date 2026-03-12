import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MessageCircle,
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  RefreshCcw,
} from "lucide-react";
import {
  fetchItemsApi,
  deleteItemApi,
} from "../../services/firebase/collection/collectionApi";

const AdminCollectionListPage = ({ collectionName = "itemsCollection" }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const data = await fetchItemsApi(collectionName);
      setItems(data);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteItemApi(collectionName, id);
      alert("Item deleted!");
      fetchAll();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // --- UI Components ---
  const SkeletonCard = () => (
    <div className="bg-white border border-gray-200 rounded-sm overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200 w-full"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 w-3/4 rounded-sm"></div>
        <div className="h-3 bg-gray-200 w-1/2 rounded-sm"></div>
      </div>
      <div className="border-t border-gray-100 flex p-3 gap-2">
        <div className="h-8 bg-gray-200 flex-1 rounded-sm"></div>
        <div className="h-8 bg-gray-200 flex-1 rounded-sm"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen font-sans text-[#212121] pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Navigation / Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-[#2874f0] font-medium hover:underline mb-4 text-sm transition-all w-fit">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Main Content Card */}
        <div className=" overflow-hidden">
          {/* Dashboard Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
            <div>
              <h1 className="text-xl font-medium text-[#212121] flex items-center gap-2">
                Manage Items
                {loading && (
                  <RefreshCcw className="w-4 h-4 text-gray-400 animate-spin" />
                )}
              </h1>
              <p className="text-xs text-[#878787] mt-1">
                Viewing items in{" "}
                <span className="font-mono text-gray-500 bg-gray-100 px-1 py-0.5 rounded">
                  {collectionName}
                </span>
              </p>
            </div>

            <button
              onClick={() => navigate("/collection/add")}
              className="bg-[#2874f0] text-white px-5 py-2.5 rounded-sm text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#1c5fba] transition-colors shadow-[0_1px_2px_0_rgba(0,0,0,0.2)]">
              <Plus className="w-4 h-4" />
              Add New Item
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 bg-[#f1f3f6]">
            {loading ? (
              /* Loading State */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : items.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-sm shadow-sm border border-gray-200 flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-10 h-10 text-[#2874f0]" />
                </div>
                <h3 className="text-lg font-medium text-[#212121] mb-2">
                  No Items Found
                </h3>
                <p className="text-sm text-[#878787] max-w-sm text-center mb-6">
                  It looks like there are no items in this collection yet. Click
                  the button above to add your first item.
                </p>
              </div>
            ) : (
              /* Items Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-200 rounded-sm hover:shadow-[0_3px_6px_0_rgba(0,0,0,0.1)] transition-shadow flex flex-col overflow-hidden group">
                    {/* Image Area */}
                    <div className="h-48 bg-gray-50 border-b border-gray-100 flex items-center justify-center overflow-hidden relative">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src =
                              "https://placehold.co/400x400?text=No+Image";
                          }}
                        />
                      ) : (
                        <div className="text-gray-300 flex flex-col items-center gap-2">
                          <ImageIcon className="w-10 h-10" />
                          <span className="text-xs font-medium">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Content Area */}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3
                        className="text-[15px] font-medium text-[#212121] line-clamp-2 leading-tight mb-1"
                        title={item.name}>
                        {item.name}
                      </h3>
                      <p
                        className="text-xs text-[#878787] font-mono mt-auto truncate"
                        title={item.id}>
                        ID: {item.id}
                      </p>
                    </div>

                    {/* Actions Area */}
                    <div className="border-t border-gray-100 flex divide-x divide-gray-100 bg-gray-50/50">
                      <button
                        onClick={() => navigate(`/collection/add/${item.id}`)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-[#2874f0] hover:bg-blue-50 transition-colors">
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCollectionListPage;
