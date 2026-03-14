import React from "react";
import { Zap, Smartphone, HardDrive, MoreVertical } from "lucide-react";

const AppInstallOverlay = ({ isOpen, onClose, appName = "bAbli" }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1100] bg-[#1a1c23]/95 backdrop-blur-md flex flex-col justify-center items-center text-white font-sans overflow-auto"
      onClick={onClose} // click outside closes
    >
      <div
        className="relative w-full max-w-md px-6 py-8 mx-auto bg-[#25262f] rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()} // prevent closing on inner click
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          Install {appName} App
        </h2>
        <p className="text-white/80 mb-6 text-center">
          Enjoy faster access, offline support, and a better mobile experience.
        </p>

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Zap size={24} />
            <span>Super fast and smooth</span>
          </div>
          <div className="flex items-center gap-3">
            <Smartphone size={24} />
            <span>Easy to access anytime</span>
          </div>
          <div className="flex items-center gap-3">
            <HardDrive size={24} />
            <span>Saves space on your device</span>
          </div>
        </div>

        <div>
          <p className="text-white/70 mb-4">
            To install, tap <MoreVertical size={16} className="inline" /> and
            select "Add to Home screen".
          </p>
          <button
            onClick={onClose}
            className="w-full bg-[#ff3f6c] hover:bg-[#eb335e] text-white py-3 rounded font-bold uppercase tracking-wide transition-transform active:scale-95">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppInstallOverlay;
