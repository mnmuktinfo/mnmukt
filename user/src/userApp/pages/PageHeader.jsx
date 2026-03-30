/**
 * PageHeader.jsx — MNMUKT Common Header
 *
 * Usage:
 *   <PageHeader title="Order History" navigate={navigate} tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
 *   <PageHeader title="My Wishlist" navigate={navigate} />   ← no tabs needed
 */

import React, { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";

const PINK = "#FF3F6C";
const PINK_D = "#da127d";

const PageHeader = ({
  title,
  subtitle,
  navigate,
  tabs = [], // [{ key, label, count }]
  activeTab = null,
  setActiveTab = () => {},
  right = null, // optional JSX in top-right (e.g. search icon)
}) => {
  const [elevated, setElevated] = useState(false);

  useEffect(() => {
    const fn = () => setElevated(window.scrollY > 6);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const hasTabs = tabs.length > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;700;800;900&display=swap');
        .ph-tab-pill { transition: background 0.18s, color 0.18s; }
        .ph-no-scrollbar::-webkit-scrollbar { display: none; }
        .ph-no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <header
        style={{ fontFamily: "'DM Sans', sans-serif" }}
        className={`bg-white sticky top-0 z-40 transition-all duration-200
          ${
            elevated
              ? "shadow-[0_2px_18px_rgba(0,0,0,0.09)]"
              : "border-b border-gray-100"
          }`}>
        {/* ── Title Row ── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-3.5 sm:py-4">
            {/* Back button */}
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center justify-center w-9 h-9 -ml-1.5 rounded-full
                hover:bg-gray-100 active:bg-gray-200 transition-colors flex-shrink-0
                focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#FF3F6C]"
              aria-label="Go back">
              <ChevronLeft
                size={22}
                className="text-gray-600 group-hover:text-[#282C3F] transition-colors"
              />
            </button>

            {/* Title + subtitle */}
            <div className="flex-1 min-w-0 ml-1">
              <h1
                className="text-[16px] sm:text-[18px] font-black uppercase tracking-[0.07em]
                  text-[#282C3F] leading-none truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[11px] text-gray-400 font-semibold mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Right slot */}
            {right && (
              <div className="flex items-center gap-1 flex-shrink-0">
                {right}
              </div>
            )}
          </div>
        </div>

        {/* ── Pink accent line (always present) ── */}
        <div
          className="h-[2.5px] w-full"
          style={{
            background: `linear-gradient(90deg, ${PINK} 0%, ${PINK_D} 100%)`,
          }}
        />

        {/* ── Tabs Row (optional) ── */}
        {hasTabs && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex overflow-x-auto ph-no-scrollbar gap-1 sm:gap-2 py-1.5">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`ph-tab-pill relative flex items-center gap-2 px-3.5 sm:px-4 py-2
                      text-[12px] sm:text-[13px] font-bold rounded-full whitespace-nowrap
                      focus:outline-none transition-all
                      ${
                        isActive
                          ? "text-[#FF3F6C] bg-[#fff0f3]"
                          : "text-gray-500 hover:text-[#282C3F] hover:bg-gray-100"
                      }`}>
                    {tab.label}

                    {/* Count badge */}
                    {tab.count !== undefined && (
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none
                          ${
                            isActive
                              ? "bg-[#FF3F6C] text-white"
                              : "bg-gray-200 text-gray-500"
                          }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default PageHeader;
