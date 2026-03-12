import React, { useState, useEffect, useMemo } from "react";
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
  FaArchive,
  FaUser,
} from "react-icons/fa";

const PAGE_SIZE = 20;

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // FETCH MESSAGES
  const fetchMessages = async (loadMore = false) => {
    if (loadMore && (!lastDoc || !hasMore)) return;

    try {
      setLoading(!loadMore);

      let q = query(
        collection(db, "contactMessages"),
        orderBy("createdAt", "desc"),
        limit(PAGE_SIZE),
      );

      if (loadMore && lastDoc) {
        q = query(
          collection(db, "contactMessages"),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(PAGE_SIZE),
        );
      }

      const snapshot = await getDocs(q);

      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMessages((prev) =>
        loadMore ? [...prev, ...newMessages] : newMessages,
      );
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);

      if (snapshot.docs.length < PAGE_SIZE) setHasMore(false);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setHasMore(true);
    fetchMessages(false);
  };

  // SEARCH FILTER
  const filteredMessages = useMemo(() => {
    if (!search) return messages;

    return messages.filter((m) =>
      m.name?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, messages]);

  // MARK AS READ
  const markAsRead = async (msg) => {
    setSelectedMessage(msg);

    if (!msg.read) {
      await updateDoc(doc(db, "contactMessages", msg.id), { read: true });

      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m)),
      );
    }
  };

  // ARCHIVE
  const handleArchive = async () => {
    if (!selectedMessage) return;

    setActionLoading(true);

    await updateDoc(doc(db, "contactMessages", selectedMessage.id), {
      status: "archived",
    });

    setMessages((prev) =>
      prev.map((m) =>
        m.id === selectedMessage.id ? { ...m, status: "archived" } : m,
      ),
    );

    setSelectedMessage((prev) => ({ ...prev, status: "archived" }));

    setActionLoading(false);
  };

  // DELETE
  const handleDelete = async () => {
    if (!selectedMessage) return;

    if (!window.confirm("Delete message permanently?")) return;

    setActionLoading(true);

    await deleteDoc(doc(db, "contactMessages", selectedMessage.id));

    setMessages((prev) => prev.filter((m) => m.id !== selectedMessage.id));
    setSelectedMessage(null);

    setActionLoading(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* LEFT SIDEBAR */}
      <div
        className={`flex flex-col border-r bg-white w-full md:w-[360px] ${selectedMessage ? "hidden md:flex" : ""}`}>
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 h-14 border-b">
          <h2 className="flex items-center gap-2 font-bold text-sm">
            <FaInbox className="text-blue-600" /> Inbox
          </h2>

          <button
            onClick={handleRefresh}
            className={`p-2 ${refreshing ? "animate-spin" : ""}`}>
            <FaSync />
          </button>
        </div>

        {/* SEARCH */}
        <div className="p-3 border-b bg-gray-50">
          <div className="relative">
            <FaSearch className="absolute top-3 left-3 text-gray-400 text-xs" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name..."
              className="w-full pl-8 pr-3 py-2 border rounded text-sm focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* MESSAGE LIST */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="p-6 text-center text-gray-400">Loading...</p>
          ) : (
            filteredMessages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => markAsRead(msg)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedMessage?.id === msg.id ? "bg-blue-50" : ""
                }`}>
                <div className="flex justify-between">
                  <span className="font-semibold text-sm">{msg.name}</span>

                  {!msg.read && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </div>

                <p className="text-xs text-blue-600 truncate">
                  {msg.subject || "No subject"}
                </p>

                <p className="text-xs text-gray-500 truncate">{msg.message}</p>
              </div>
            ))
          )}

          {hasMore && (
            <button
              onClick={() => fetchMessages(true)}
              className="w-full py-4 text-xs text-gray-500 hover:text-blue-600">
              Load More
            </button>
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col bg-white">
        {!selectedMessage ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a message
          </div>
        ) : (
          <>
            {/* TOP BAR */}
            <div className="h-14 border-b flex items-center justify-between px-6">
              <button
                onClick={() => setSelectedMessage(null)}
                className="md:hidden">
                <FaArrowLeft />
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handleArchive}
                  disabled={actionLoading}
                  className="p-2 hover:text-blue-600">
                  <FaArchive />
                </button>

                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="p-2 hover:text-red-600">
                  <FaTrashAlt />
                </button>
              </div>
            </div>

            {/* MESSAGE BODY */}
            <div className="p-8 overflow-y-auto">
              <div className="flex gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <FaUser />
                </div>

                <div>
                  <h2 className="font-bold text-lg">{selectedMessage.name}</h2>

                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <FaEnvelope /> {selectedMessage.email}
                  </p>

                  {selectedMessage.phone && (
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <FaPhone /> {selectedMessage.phone}
                    </p>
                  )}
                </div>
              </div>

              <h3 className="font-semibold mb-3">
                {selectedMessage.subject || "Message"}
              </h3>

              <p className="text-gray-700 whitespace-pre-wrap text-sm">
                {selectedMessage.message}
              </p>

              <button
                onClick={() =>
                  (window.location.href = `mailto:${selectedMessage.email}`)
                }
                className="mt-10 bg-blue-600 text-white px-6 py-3 rounded flex items-center gap-2">
                <FaReply /> Reply
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;
a;
