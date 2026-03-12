import React, { useState } from "react";

export default function AdminGuide() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-4 shadow-sm">
      <div className="text-blue-600 mt-0.5 shrink-0">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-blue-900 mb-1">
          Quick Guide for Admins
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>
            <strong>Search:</strong> Use the search bar to find customers by
            name, email, or phone.
          </li>
          <li>
            <strong>Edit:</strong> Click "Edit" to update a customer's details.
            Remember, phone numbers must be exactly 10 digits.
          </li>
          <li>
            <strong>Delete:</strong> Click "Delete" to permanently remove a
            customer. You will be asked to confirm.
          </li>
        </ul>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="text-blue-400 hover:text-blue-600 transition-colors shrink-0"
        title="Dismiss guide">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
