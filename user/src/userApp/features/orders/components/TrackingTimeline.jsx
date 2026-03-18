import { Check, X } from "lucide-react";

// ─── TRACKING TIMELINE ───
const TrackingTimeline = ({ steps }) => (
  <div className="relative pl-6 py-2">
    <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-gray-200" />
    <div
      className="absolute left-[11px] top-4 w-[2px] bg-[#03A685] transition-all duration-500"
      style={{
        height: `${((steps.filter((s) => s.completed).length - 1) / (steps.length - 1)) * 100}%`,
      }}
    />
    <div className="space-y-8">
      {steps.map((step, idx) => (
        <div key={idx} className="relative flex gap-5 items-start z-10">
          <div className="mt-0.5 shrink-0 bg-white py-1">
            {step.isError ? (
              <div className="w-5 h-5 rounded-full bg-[#FF3F6C] flex items-center justify-center -ml-2.5 shadow-[0_0_0_4px_white]">
                <X size={12} className="text-white" strokeWidth={3} />
              </div>
            ) : step.completed ? (
              <div className="w-5 h-5 rounded-full bg-[#03A685] flex items-center justify-center -ml-2.5 shadow-[0_0_0_4px_white]">
                <Check size={12} className="text-white" strokeWidth={3} />
              </div>
            ) : (
              <div className="w-3 h-3 rounded-full bg-gray-300 -ml-1.5 shadow-[0_0_0_4px_white]" />
            )}
          </div>
          <div className="-mt-1 flex-1">
            <p
              className={`text-[14px] font-bold ${step.completed || step.isError ? "text-[#282C3F]" : "text-gray-400"}`}>
              {step.status}
            </p>
            {step.description && (
              <p className="text-[12px] text-[#535766] mt-1 leading-relaxed">
                {step.description}
              </p>
            )}
            {step.date && (
              <p className="text-[11px] font-medium text-gray-400 mt-1 uppercase tracking-wide">
                {step.date}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default TrackingTimeline;
