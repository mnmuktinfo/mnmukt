import React, { useState, useEffect, useMemo } from "react";
import { db } from "../config/firebaseauth";
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
  FaReply,
  FaArchive,
} from "react-icons/fa";

const PAGE_SIZE = 20;

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // FETCH MESSAGES
  const fetchMessages = async (loadMore = false) => {
    if (loadMore && (!lastDoc || !hasMore)) return;

    try {
      if (!loadMore) setLoading(true);

      let q = query(
        collection(db, "inquiries"),
        orderBy("createdAt", "desc"),
        limit(PAGE_SIZE),
      );

      if (loadMore && lastDoc) {
        q = query(
          collection(db, "inquiries"),
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
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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
    return messages.filter(
      (m) =>
        m.name?.toLowerCase().includes(search.toLowerCase()) ||
        m.subject?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, messages]);

  // MARK AS READ
  const markAsRead = async (msg) => {
    setSelectedMessage(msg);
    if (!msg.read) {
      // Optimistic UI update
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m)),
      );
      try {
        await updateDoc(doc(db, "inquiries", msg.id), { read: true });
      } catch (error) {
        console.error("Failed to mark as read", error);
      }
    }
  };

  // ARCHIVE
  const handleArchive = async () => {
    if (!selectedMessage) return;
    setActionLoading(true);
    try {
      await updateDoc(doc(db, "inquiries", selectedMessage.id), {
        status: "archived",
      });
      setMessages((prev) =>
        prev.map((m) =>
          m.id === selectedMessage.id ? { ...m, status: "archived" } : m,
        ),
      );
      setSelectedMessage((prev) => ({ ...prev, status: "archived" }));
    } catch (error) {
      console.error("Failed to archive", error);
    } finally {
      setActionLoading(false);
    }
  };

  // DELETE
  const handleDelete = async () => {
    if (!selectedMessage) return;
    if (
      !window.confirm(
        "Are you sure you want to delete this message permanently?",
      )
    )
      return;

    setActionLoading(true);
    try {
      await deleteDoc(doc(db, "contactMessages", selectedMessage.id));
      setMessages((prev) => prev.filter((m) => m.id !== selectedMessage.id));
      setSelectedMessage(null);
    } catch (error) {
      console.error("Failed to delete", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Format date helper
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // --- UI Components ---
  const SkeletonMessage = () => (
    <div className="p-4 border-b border-gray-100 animate-pulse flex gap-3">
      <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0"></div>
      <div className="flex-1 space-y-2 py-1">
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 w-24 rounded"></div>
          <div className="h-2 bg-gray-200 w-12 rounded"></div>
        </div>
        <div className="h-3 bg-gray-200 w-3/4 rounded"></div>
        <div className="h-2 bg-gray-200 w-full rounded mt-2"></div>
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#f4f6f8] font-sans overflow-hidden">
      {/* LEFT SIDEBAR - MESSAGE LIST */}
      <div
        className={`flex flex-col bg-white border-r border-gray-200 w-full md:w-[380px] shrink-0 transition-transform ${
          selectedMessage ? "hidden md:flex" : "flex"
        }`}>
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-200 bg-white shrink-0">
          <h2 className="flex items-center gap-2 font-bold text-lg text-gray-900 tracking-tight">
            <FaInbox className="text-blue-600" /> Inbox
          </h2>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors ${
              refreshing ? "animate-spin text-blue-600" : ""
            }`}>
            <FaSync />
          </button>
        </div>

        {/* SEARCH */}
        <div className="p-4 border-b border-gray-200 bg-[#f9fafb] shrink-0">
          <div className="relative">
            <FaSearch className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400 text-sm" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {/* MESSAGE LIST */}
        <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
          {loading ? (
            <>
              <SkeletonMessage />
              <SkeletonMessage />
              <SkeletonMessage />
              <SkeletonMessage />
              <SkeletonMessage />
            </>
          ) : filteredMessages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                <FaInbox className="text-xl text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900">
                No messages found
              </p>
              <p className="text-xs mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => markAsRead(msg)}
                  className={`p-4 cursor-pointer transition-colors relative group ${
                    selectedMessage?.id === msg.id
                      ? "bg-blue-50/50"
                      : msg.read
                        ? "bg-white hover:bg-gray-50"
                        : "bg-[#f4f8fc] hover:bg-[#ebf4fb]"
                  }`}>
                  {selectedMessage?.id === msg.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
                  )}

                  <div className="flex gap-3">
                    {/* Avatar Initials */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                        msg.read
                          ? "bg-gray-100 text-gray-600"
                          : "bg-gradient-to-tr from-blue-600 to-blue-400 text-white shadow-sm"
                      }`}>
                      {msg.name?.charAt(0).toUpperCase() || "?"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span
                          className={`text-sm truncate pr-2 ${msg.read ? "font-medium text-gray-900" : "font-bold text-gray-900"}`}>
                          {msg.name}
                        </span>
                        <span
                          className={`text-xs whitespace-nowrap ${msg.read ? "text-gray-400" : "text-blue-600 font-semibold"}`}>
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                      <p
                        className={`text-xs truncate mb-1 ${msg.read ? "text-gray-600" : "font-semibold text-gray-800"}`}>
                        {msg.subject || "No Subject"}
                      </p>
                      <p
                        className={`text-xs truncate ${msg.read ? "text-gray-400" : "text-gray-600"}`}>
                        {msg.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasMore && !loading && filteredMessages.length > 0 && (
            <div className="p-4 flex justify-center border-t border-gray-100">
              <button
                onClick={() => fetchMessages(true)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                Load Older Messages
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL - READING PANE */}
      <div
        className={`flex-1 flex flex-col bg-white md:flex relative ${!selectedMessage ? "hidden" : "flex"}`}>
        {!selectedMessage ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-[#f9fafb]">
            <div className="w-24 h-24 mb-6 rounded-full bg-blue-50 flex items-center justify-center">
              <FaEnvelope className="text-4xl text-blue-200" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Your Inbox is Empty
            </h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Select a message from the list on the left to read its contents
              and take action.
            </p>
          </div>
        ) : (
          <>
            {/* TOP ACTION BAR */}
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0">
              <button
                onClick={() => setSelectedMessage(null)}
                className="md:hidden flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-1.5 -ml-3 rounded-lg hover:bg-gray-100 transition-colors">
                <FaArrowLeft />{" "}
                <span className="text-sm font-medium">Back</span>
              </button>

              <div className="flex gap-2 ml-auto">
                <button
                  onClick={handleArchive}
                  disabled={
                    actionLoading || selectedMessage.status === "archived"
                  }
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 transition-all"
                  title="Archive Message">
                  <FaArchive
                    className={
                      selectedMessage.status === "archived"
                        ? "text-blue-600"
                        : "text-gray-500"
                    }
                  />
                  <span className="hidden sm:inline">
                    {selectedMessage.status === "archived"
                      ? "Archived"
                      : "Archive"}
                  </span>
                </button>

                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-red-50 hover:border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:opacity-50 transition-all"
                  title="Delete Message">
                  <FaTrashAlt />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>

            {/* MESSAGE BODY */}
            <div className="flex-1 overflow-y-auto bg-white relative">
              {/* Action Loading Overlay */}
              {actionLoading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="bg-white px-4 py-2 rounded-full shadow-lg border border-gray-100 flex items-center gap-2 text-sm font-semibold text-blue-600">
                    <FaSync className="animate-spin" /> Processing...
                  </div>
                </div>
              )}

              <div className="max-w-3xl mx-auto p-6 md:p-10">
                {/* Email Header */}
                <h1 className="text-2xl font-bold text-gray-900 mb-6 leading-tight">
                  {selectedMessage.subject || "(No Subject)"}
                </h1>

                <div className="flex items-start gap-4 mb-10 pb-6 border-b border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 border border-gray-300 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-gray-600">
                      {selectedMessage.name?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <h2 className="font-semibold text-gray-900 text-base">
                          {selectedMessage.name}
                        </h2>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                          <a
                            href={`mailto:${selectedMessage.email}`}
                            className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors">
                            <FaEnvelope className="text-gray-400" />{" "}
                            {selectedMessage.email}
                          </a>
                          {selectedMessage.phone && (
                            <a
                              href={`tel:${selectedMessage.phone}`}
                              className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors">
                              <FaPhone className="text-gray-400" />{" "}
                              {selectedMessage.phone}
                            </a>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md">
                        {formatDate(selectedMessage.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Email Content */}
                <div className="prose prose-sm sm:prose-base max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>

                {/* Reply Action */}
                <div className="mt-12 pt-6 border-t border-gray-100">
                  <button
                    onClick={() =>
                      (window.location.href = `mailto:${selectedMessage.email}`)
                    }
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 shadow-sm transition-all focus:ring-4 focus:ring-slate-900/20">
                    <FaReply /> Reply to {selectedMessage.name.split(" ")[0]}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
