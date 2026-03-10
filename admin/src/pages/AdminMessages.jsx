import React, { useState, useEffect } from "react";
import { db } from "../config/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
// Clear, recognizable icons
import {
  FaSearch,
  FaSync,
  FaTrashAlt,
  FaInbox,
  FaArrowLeft,
  FaEnvelope,
  FaPhone,
  FaShoppingBag,
  FaReply,
  FaRegFolderOpen,
  FaArchive,
  FaUser,
} from "react-icons/fa";

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Optimized Fetch
  const fetchMessages = async (isLoadMore = false) => {
    if (isLoadMore && (!lastDoc || !hasMore)) return;
    if (!isLoadMore) setLoading(true);

    try {
      let q = query(
        collection(db, "contactMessages"),
        orderBy("createdAt", "desc"),
        limit(15),
      );
      if (isLoadMore && lastDoc) {
        q = query(
          collection(db, "contactMessages"),
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
      setMessages((prev) => (isLoadMore ? [...prev, ...newDocs] : newDocs));
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      if (snapshot.docs.length < 15) setHasMore(false);
    } catch (error) {
      console.error("Fetch error:", error);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMessages(false);
  };

  const handleArchive = async () => {
    if (!selectedMessage) return;
    setActionLoading(true);
    try {
      await updateDoc(doc(db, "contactMessages", selectedMessage.id), {
        status: "archived",
      });
      setMessages((prev) =>
        prev.map((m) =>
          m.id === selectedMessage.id ? { ...m, status: "archived" } : m,
        ),
      );
      setSelectedMessage((prev) => ({ ...prev, status: "archived" }));
    } catch (err) {
      alert("Archive failed");
    }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    if (!selectedMessage || !window.confirm("Delete this message forever?"))
      return;
    setActionLoading(true);
    try {
      await deleteDoc(doc(db, "contactMessages", selectedMessage.id));
      setMessages((prev) => prev.filter((m) => m.id !== selectedMessage.id));
      setSelectedMessage(null);
    } catch (err) {
      alert("Delete failed");
    }
    setActionLoading(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans ">
      {/* 1. LEFT PANEL: LIST OF MESSAGES */}
      <div
        className={`flex flex-col border-r border-gray-200 w-full md:w-[350px] bg-white transition-all ${selectedMessage ? "hidden md:flex" : "flex"}`}>
        {/* Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-gray-100 shrink-0">
          <h2 className="font-bold text-gray-800 flex items-center gap-2 uppercase text-xs tracking-wider">
            <FaInbox className="text-blue-600" /> Inbox
          </h2>
          <button
            onClick={handleRefresh}
            className={`p-2 text-gray-400 hover:text-blue-600 active:scale-90 ${refreshing ? "animate-spin" : ""}`}>
            <FaSync size={14} />
          </button>
        </div>

        {/* Simple Search */}
        <div className="p-3 bg-gray-50/50 border-b border-gray-100">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
            <input
              type="text"
              placeholder="Search by name..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded text-sm focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <p className="p-10 text-center text-gray-400 text-xs italic">
              Loading Messages...
            </p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => setSelectedMessage(msg)}
                className={`p-4 border-b border-gray-50 cursor-pointer transition-all border-l-4 ${
                  selectedMessage?.id === msg.id
                    ? "bg-blue-50 border-l-blue-600"
                    : "hover:bg-gray-50 border-l-transparent"
                }`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-gray-900 truncate">
                    {msg.name}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {msg.createdAt?.toDate().toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs font-semibold text-blue-600 truncate">
                  {msg.subject || "No Subject"}
                </p>
                <p className="text-xs text-gray-500 truncate mt-1">
                  {msg.message}
                </p>

                {msg.status === "archived" && (
                  <span className="mt-2 inline-block text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-bold uppercase">
                    Archived
                  </span>
                )}
              </div>
            ))
          )}
          {hasMore && (
            <button
              onClick={() => fetchMessages(true)}
              className="w-full py-4 text-xs font-bold text-gray-400 hover:text-blue-600 uppercase tracking-widest">
              Load More
            </button>
          )}
        </div>
      </div>

      {/* 2. RIGHT PANEL: MESSAGE CONTENT */}
      <div
        className={`flex-1 flex flex-col ${!selectedMessage ? "hidden md:flex items-center justify-center bg-gray-50" : "flex bg-white"}`}>
        {selectedMessage ? (
          <>
            {/* Action Header */}
            <div className="h-14 px-6 border-b border-gray-200 flex items-center justify-between bg-white shrink-0 sticky top-0">
              <button
                onClick={() => setSelectedMessage(null)}
                className="md:hidden text-gray-400 mr-2">
                <FaArrowLeft />
              </button>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${selectedMessage.status === "archived" ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-700"}`}>
                  {selectedMessage.status === "archived"
                    ? "Closed"
                    : "Active Inquiry"}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleArchive}
                  disabled={actionLoading}
                  className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all active:scale-90"
                  title="Archive">
                  <FaArchive size={14} />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all active:scale-90"
                  title="Delete">
                  <FaTrashAlt size={14} />
                </button>
              </div>
            </div>

            {/* Message Details */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10">
              <div className="max-w-3xl mx-auto">
                {/* Contact Info Card */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 shadow-sm">
                      <FaUser size={20} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900">
                        {selectedMessage.name}
                      </h2>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <FaEnvelope className="text-blue-500" />
                          <a
                            href={`mailto:${selectedMessage.email}`}
                            className="hover:underline font-medium text-blue-600">
                            {selectedMessage.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <FaPhone className="text-blue-500" />
                          <span className="font-medium">
                            {selectedMessage.phone || "No Phone"}
                          </span>
                        </div>
                        {selectedMessage.orderId && (
                          <div className="flex items-center gap-3 text-sm text-gray-600 col-span-full">
                            <FaShoppingBag className="text-orange-500" />
                            <span className="font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                              Order Ref: {selectedMessage.orderId}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actual Message */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
                    {selectedMessage.subject || "Message Text"}
                  </h3>
                  <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap py-4">
                    {selectedMessage.message}
                  </div>
                </div>

                {/* Quick Reply Button */}
                <div className="mt-10 pt-10 border-t border-gray-100">
                  <button
                    onClick={() =>
                      (window.location.href = `mailto:${selectedMessage.email}`)
                    }
                    className="flex items-center justify-center gap-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded shadow-md transition-all active:scale-95">
                    <FaReply /> Click to Reply via Email
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center">
            <FaRegFolderOpen size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-medium">
              Select a message from the left to view details
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;
