/**
 * MessageDetail.jsx — RIGHT PANEL (lazy-loaded chunk)
 *
 * Pure presentational panel. Firebase actions come as props.
 * Loaded only when a message is first selected — zero cost on initial load.
 */

import React from "react";
import {
  ArrowLeft,
  Archive,
  Trash2,
  Reply,
  Mail,
  Phone,
  ShoppingBag,
  Clock,
  Loader2,
  Info,
} from "lucide-react";
import {
  MsgAvatar,
  StatusBadge,
  Chip,
  IconBtn,
  fmtDate,
  FK,
} from "../ui/Sharedui";

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
export const EmptyState = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#F1F3F6]">
    <div className="bg-white border border-gray-200 rounded shadow-sm p-8 max-w-md w-full">
      <div className="h-1 w-12 bg-[#2874F0] rounded-full mb-6" />
      <h2 className="text-base font-black text-[#212121] mb-2 uppercase tracking-wide">
        Message Centre
      </h2>
      <p className="text-[#878787] text-sm mb-6 leading-relaxed">
        Select a message from the inbox to read the full conversation, reply,
        archive, or delete it.
      </p>
      <div className="bg-[#FFF9E6] border border-[#F7E6A1] p-4 rounded">
        <p className="text-[10px] font-black text-[#856404] uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <Info size={12} /> Tips
        </p>
        <ul className="text-[11px] text-[#856404] space-y-1.5 list-disc list-inside ml-1 leading-relaxed">
          <li>Inbox cached — navigating back is instant</li>
          <li>Archive / Delete updates instantly (optimistic UI)</li>
          <li>Auto scroll-loads more messages as you reach the bottom</li>
          <li>Search across all loaded messages with zero Firebase reads</li>
        </ul>
      </div>
    </div>
  </div>
);

// ─── CONTACT INFO CARD ────────────────────────────────────────────────────────
const ContactCard = ({ m }) => (
  <div className="bg-white border border-gray-200 rounded shadow-sm p-5">
    {/* Header strip */}
    <div
      className="h-1.5 rounded-t-sm -mx-5 -mt-5 mb-5"
      style={{ background: `linear-gradient(90deg, ${FK.blue}, ${FK.orange})` }}
    />

    <div className="flex items-start gap-4">
      <MsgAvatar name={m.name} size="lg" />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h2 className="text-lg font-black text-[#212121] leading-tight">
            {m.name || "Anonymous"}
          </h2>
          <StatusBadge
            status={
              m.status === "archived"
                ? "archived"
                : m.read
                  ? "active"
                  : "unread"
            }
          />
        </div>

        <p className="text-[11px] text-[#878787] mb-4 flex items-center gap-1.5">
          <Clock size={11} />
          {fmtDate(m.createdAt)}
          {m.createdAt && (
            <span className="opacity-60">
              ·{" "}
              {(() => {
                try {
                  const d = m.createdAt?.toDate
                    ? m.createdAt.toDate()
                    : new Date(m.createdAt);
                  return d.toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                } catch {
                  return "";
                }
              })()}
            </span>
          )}
        </p>

        {/* Chips row */}
        <div className="flex flex-wrap gap-2">
          <Chip
            icon={<Mail size={11} />}
            label={m.email || "No email"}
            color="blue"
          />
          {m.phone && (
            <Chip icon={<Phone size={11} />} label={m.phone} color="gray" />
          )}
          {m.orderId && (
            <Chip
              icon={<ShoppingBag size={11} />}
              label={`Order: ${m.orderId}`}
              color="orange"
            />
          )}
        </div>
      </div>
    </div>
  </div>
);

// ─── MESSAGE BODY CARD ────────────────────────────────────────────────────────
const MessageBody = ({ m }) => (
  <div className="bg-white border border-gray-200 rounded shadow-sm">
    {/* Subject header */}
    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60">
      <p className="text-[10px] font-black text-[#878787] uppercase tracking-widest mb-1">
        Subject
      </p>
      <h3 className="text-base font-black text-[#212121] leading-snug">
        {m.subject || "No Subject"}
      </h3>
    </div>

    {/* Body */}
    <div className="px-5 py-5">
      <p className="text-sm text-[#424242] leading-relaxed whitespace-pre-wrap">
        {m.message || "No message content."}
      </p>
    </div>
  </div>
);

// ─── REPLY CARD ───────────────────────────────────────────────────────────────
const ReplyCard = ({ email }) => (
  <div className="bg-white border border-gray-200 rounded shadow-sm p-5">
    <p className="text-[10px] font-black text-[#878787] uppercase tracking-widest mb-3">
      Quick Reply
    </p>
    <a
      href={`mailto:${email}`}
      className="flex items-center justify-center gap-2.5 w-full py-3 rounded font-black text-xs uppercase tracking-widest text-white transition-all hover:opacity-90 active:scale-[0.98]"
      style={{ background: `linear-gradient(90deg, ${FK.blue}, #1a5dc8)` }}>
      <Reply size={14} />
      Reply via Email
    </a>
    <p className="text-[10px] text-[#BDBDBD] text-center mt-2">
      Opens your default mail client
    </p>
  </div>
);

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
const MessageDetail = ({
  message: m,
  onBack,
  onArchive,
  onDelete,
  actionLoading,
}) => {
  if (!m) return null;

  return (
    <div className="flex flex-col h-full">
      {/* ── Top action bar ── */}
      <div className="h-14 px-4 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
        {/* Mobile back */}
        <button
          onClick={onBack}
          className="md:hidden p-1.5 text-[#878787] hover:text-[#2874F0] rounded mr-1 transition-colors">
          <ArrowLeft size={18} />
        </button>

        {/* Status badge */}
        <div className="flex items-center gap-2">
          <StatusBadge
            status={
              m.status === "archived"
                ? "archived"
                : m.read
                  ? "active"
                  : "unread"
            }
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 ml-auto">
          <IconBtn
            icon={<Archive size={15} />}
            label="Archive"
            variant="archive"
            disabled={actionLoading || m.status === "archived"}
            onClick={onArchive}
          />
          <IconBtn
            icon={
              actionLoading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Trash2 size={15} />
              )
            }
            label="Delete"
            variant="danger"
            disabled={actionLoading}
            onClick={onDelete}
          />
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 md:p-6 lg:p-8 bg-[#F1F3F6]">
        <div className="max-w-3xl mx-auto space-y-4">
          <ContactCard m={m} />
          <MessageBody m={m} />
          {m.email && <ReplyCard email={m.email} />}
        </div>
      </div>
    </div>
  );
};

export default MessageDetail;
