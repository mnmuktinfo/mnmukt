import React, { useMemo } from "react";

const RunningBrandTicker = React.memo(({ items }) => {
  const defaultItems = useMemo(
    () => [
      "Handloom Cotton",
      "Made In India",
      "Wear Babli",
      "Be Bubbly",
      "Homegrown",
    ],
    [],
  );

  // ✅ stable items
  const displayItems = useMemo(() => {
    return items && items.length > 0 ? items : defaultItems;
  }, [items, defaultItems]);

  // ✅ duplicate ONLY 2 times (correct infinite loop trick)
  const marqueeItems = useMemo(() => {
    return [...displayItems, ...displayItems];
  }, [displayItems]);

  return (
    <div className="w-full overflow-hidden bg-white py-3 ">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 30s linear infinite;
        }
      `}</style>

      {/* Track */}
      <div className="marquee-track">
        {marqueeItems.map((text, index) => (
          <span
            key={index}
            className="text-[#da127d] text-[13px] md:text-[14px] font-medium tracking-[0.08em] whitespace-nowrap px-6 md:px-10">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
});

export default RunningBrandTicker;
