/**
 * MessageList.jsx — LEFT PANEL (lazy-loaded chunk)
 *
 * Owns:
 *  - Search input with 300ms debounce (client-side, no extra reads)
 *  - Filter tabs: All / Unread / Archived
 *  - Scroll-to-load-more via IntersectionObserver (no button needed)
 *  - Active/selected highlighting
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Search, RefreshCw, Inbox, X, Mail } from "lucide-react";
import MessageRow from "../ui/Messagerow";
import { FKLoader, Divider } from "../ui/Sharedui";

const DEBOUNCE_MS = 300;
const TABS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "archived", label: "Archived" },
];

const MessageList = ({
  messages,
  hasMore,
  loading,
  loadingMore,
  error,
  unreadCount,
  selectedId,
  onSelect,
  onLoadMore,
  onRefresh,
}) => {
  const [rawSearch, setRawSearch] = useState("");
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const debounceRef = useRef(null);
  const sentinelRef = useRef(null); // IntersectionObserver target

  // ── Debounced search ─────────────────────────────────────────────────────
  const handleSearch = useCallback((e) => {
    const val = e.target.value;
    setRawSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQuery(val.trim().toLowerCase());
    }, DEBOUNCE_MS);
  }, []);

  const clearSearch = useCallback(() => {
    setRawSearch("");
    setQuery("");
    clearTimeout(debounceRef.current);
  }, []);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  // ── IntersectionObserver for scroll-to-load ──────────────────────────────
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMore();
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [onLoadMore]);

  // ── Filtered list ────────────────────────────────────────────────────────
  const displayList = useMemo(() => {
    let list = messages;

    // Tab filter
    if (activeTab === "unread") list = list.filter((m) => !m.read);
    if (activeTab === "archived")
      list = list.filter((m) => m.status === "archived");

    // Search filter
    if (query) {
      list = list.filter(
        (m) =>
          m.name?.toLowerCase().includes(query) ||
          m.email?.toLowerCase().includes(query) ||
          m.subject?.toLowerCase().includes(query) ||
          m.message?.toLowerCase().includes(query),
      );
    }

    return list;
  }, [messages, activeTab, query]);

  // ── Group by date ────────────────────────────────────────────────────────
  const grouped = useMemo(() => {
    const groups = {};
    displayList.forEach((m) => {
      let label = "Older";
      if (m.createdAt) {
        try {
          const d = m.createdAt?.toDate
            ? m.createdAt.toDate()
            : new Date(m.createdAt);
          const now = new Date();
          const diff = (now - d) / 86400000;
          if (diff < 1) label = "Today";
          else if (diff < 2) label = "Yesterday";
          else if (diff < 7) label = "This Week";
        } catch {}
      }
      if (!groups[label]) groups[label] = [];
      groups[label].push(m);
    });
    const order = ["Today", "Yesterday", "This Week", "Older"];
    return order
      .filter((k) => groups[k])
      .map((k) => ({ label: k, items: groups[k] }));
  }, [displayList]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ── Header ── */}
      <div className="h-14 px-4 border-b border-gray-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Inbox size={15} className="text-[#2874F0]" />
          <span className="text-[11px] font-black uppercase tracking-widest text-[#212121]">
            Inbox
          </span>
          {unreadCount > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#2874F0] text-white text-[9px] font-black flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={onRefresh}
          title="Refresh inbox"
          className="p-2 text-[#878787] hover:text-[#2874F0] rounded transition-colors">
          <RefreshCw
            size={14}
            className={loading ? "animate-spin text-[#2874F0]" : ""}
          />
        </button>
      </div>

      {/* ── Search ── */}
      <div className="px-3 py-2.5 border-b border-gray-200 bg-[#F8F9FA] shrink-0">
        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded focus-within:border-[#2874F0] focus-within:shadow-[0_0_0_2px_rgba(40,116,240,0.12)] transition-all">
          <Search className="ml-3 text-gray-400 shrink-0" size={13} />
          <input
            type="text"
            placeholder="Search messages…"
            value={rawSearch}
            onChange={handleSearch}
            className="flex-1 py-2 text-sm outline-none bg-transparent placeholder:text-[#BDBDBD]"
          />
          {rawSearch && (
            <button
              onClick={clearSearch}
              className="mr-2 text-gray-400 hover:text-gray-600">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex border-b border-gray-200 shrink-0 bg-white">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${
              activeTab === tab.key
                ? "text-[#2874F0] border-b-[#2874F0]"
                : "text-[#878787] border-b-transparent hover:text-[#424242]"
            }`}>
            {tab.label}
            {tab.key === "unread" && unreadCount > 0 && (
              <span className="ml-1 text-[8px] font-black bg-[#2874F0] text-white px-1 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mx-3 mt-2 p-2.5 bg-red-50 border border-red-200 rounded text-[11px] text-red-700 font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={onRefresh} className="font-black underline ml-2">
            Retry
          </button>
        </div>
      )}

      {/* ── List body ── */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {loading ? (
          <FKLoader label="Loading messages…" />
        ) : displayList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Mail size={28} className="text-gray-200" />
            <p className="text-xs font-semibold text-[#878787]">
              {query ? "No matching messages" : "Your inbox is empty"}
            </p>
          </div>
        ) : (
          <>
            {grouped.map(({ label, items }) => (
              <React.Fragment key={label}>
                <Divider label={label} />
                {items.map((m) => (
                  <MessageRow
                    key={m.id}
                    message={m}
                    isSelected={selectedId === m.id}
                    onClick={onSelect}
                  />
                ))}
              </React.Fragment>
            ))}

            {/* Invisible sentinel for IntersectionObserver */}
            {hasMore && !query && (
              <div ref={sentinelRef} className="h-4 w-full" />
            )}

            {loadingMore && <FKLoader label="Loading more…" mini />}

            {!hasMore && !query && messages.length > 0 && (
              <p className="text-center text-[10px] text-[#BDBDBD] font-black uppercase tracking-widest py-5">
                All messages loaded
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MessageList;
