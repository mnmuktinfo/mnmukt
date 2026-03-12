/**
 * MessageRow.jsx
 * Memoized single inbox row. Re-renders ONLY when its own message changes.
 */

import React from "react";
import { MsgAvatar, fmtDate } from "./Sharedui";

const MessageRow = React.memo(({ message: m, isSelected, onClick }) => {
  const isUnread = !m.read;
  const isArchived = m.status === "archived";

  return (
    <div
      onClick={() => onClick(m)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick(m)}
      className={`relative px-4 py-3.5 cursor-pointer flex items-start gap-3 transition-all duration-100 border-l-[3px] outline-none select-none
        ${
          isSelected
            ? "bg-[#EBF2FF] border-l-[#2874F0]"
            : "hover:bg-gray-50 border-l-transparent"
        }
      `}>
      {/* Unread dot */}
      {isUnread && !isArchived && (
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#2874F0]" />
      )}

      <MsgAvatar name={m.name} size="sm" />

      <div className="flex-1 min-w-0">
        {/* Row 1: name + time */}
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span
            className={`text-[13px] truncate leading-tight ${
              isUnread && !isArchived
                ? "font-black text-[#212121]"
                : "font-semibold text-[#424242]"
            }`}>
            {m.name || "Anonymous"}
          </span>
          <span className="text-[10px] text-[#BDBDBD] shrink-0 font-medium">
            {fmtDate(m.createdAt)}
          </span>
        </div>

        {/* Row 2: subject */}
        <p
          className={`text-[11px] truncate leading-tight ${
            isSelected ? "text-[#2874F0]" : "text-[#2874F0]/80"
          } font-bold`}>
          {m.subject || "No Subject"}
        </p>

        {/* Row 3: preview */}
        <p className="text-[11px] text-[#9E9E9E] truncate mt-0.5 leading-tight">
          {m.message}
        </p>

        {/* Archived tag */}
        {isArchived && (
          <span className="mt-1.5 inline-block text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">
            Archived
          </span>
        )}
      </div>
    </div>
  );
});

MessageRow.displayName = "MessageRow";
export default MessageRow;
