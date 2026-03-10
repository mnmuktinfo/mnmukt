import React from "react";
import { FaArrowTrendUp, FaArrowTrendDown, FaMinus } from "react-icons/fa6";

const StatCard = ({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon: Icon,
  color = "onyx", // Focus on 'onyx' or 'pink'
  loading = false,
}) => {
  // Mnmukt Luxury Color Palette
  const colorClasses = {
    onyx: {
      bg: "bg-slate-50",
      text: "text-slate-950",
      border: "border-slate-100",
      accent: "bg-slate-950",
    },
    pink: {
      bg: "bg-pink-50/50",
      text: "text-[#ff356c]",
      border: "border-pink-100/50",
      accent: "bg-[#ff356c]",
    },
  };

  const theme = colorClasses[color] || colorClasses.onyx;

  const getTrendIcon = () => {
    if (trend === "up") return <FaArrowTrendUp size={12} />;
    if (trend === "down") return <FaArrowTrendDown size={12} />;
    return <FaMinus size={12} />;
  };

  const getTrendColor = () => {
    if (trend === "up") return "text-emerald-500";
    if (trend === "down") return "text-red-500";
    return "text-slate-400";
  };

  if (loading) {
    return (
      <div className="bg-white p-6 border border-slate-100 animate-pulse">
        <div className="flex justify-between items-start">
          <div className="space-y-3 flex-1">
            <div className="h-2 bg-slate-100 rounded-full w-1/3"></div>
            <div className="h-6 bg-slate-100 rounded-sm w-1/2"></div>
            <div className="h-2 bg-slate-100 rounded-full w-1/4"></div>
          </div>
          <div className="w-10 h-10 bg-slate-100 rounded-sm"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white p-6 border ${theme.border} relative overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:shadow-slate-100`}>
      {/* Architectural Accent Bar */}
      <div
        className={`absolute top-0 left-0 w-1 h-full ${theme.accent} opacity-0 group-hover:opacity-100 transition-opacity`}
      />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">
            {title}
          </p>
          <p className="text-3xl font-bold tracking-tighter text-slate-950 leading-none">
            {value}
          </p>

          {(subtitle || trendValue) && (
            <div className="flex items-center gap-2 mt-4">
              {trendValue && (
                <div
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-slate-50 ${getTrendColor()}`}>
                  {getTrendIcon()}
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {trendValue}
                  </span>
                </div>
              )}
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter italic font-serif">
                {subtitle}
              </span>
            </div>
          )}
        </div>

        {Icon && (
          <div
            className={`w-12 h-12 flex items-center justify-center rounded-sm transition-colors duration-500 ${theme.bg}`}>
            <Icon size={20} className={theme.text} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
