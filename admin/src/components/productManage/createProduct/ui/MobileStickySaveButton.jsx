import { CheckCircle2, Loader2, Save } from "lucide-react";
import React from "react";

const MobileStickySaveButton = ({
  handleSubmit,
  isBusy,
  isEditing,
  loading,
  success,
}) => {
  return (
    <div className="fixed bottom-0 inset-x-0 sm:hidden bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] p-4 z-50">
      <button
        onClick={handleSubmit}
        disabled={isBusy}
        className="w-full flex items-center justify-center gap-2 bg-[#2874F0] text-white py-3.5 rounded-sm font-medium text-[15px] active:scale-95 transition-all disabled:opacity-60 shadow-sm">
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" /> Saving…
          </>
        ) : success ? (
          <>
            <CheckCircle2 className="w-5 h-5" /> Saved!
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />{" "}
            {isEditing ? "Save Changes" : "Publish Product"}
          </>
        )}
      </button>
    </div>
  );
};

export default MobileStickySaveButton;
