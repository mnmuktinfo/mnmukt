const CategoryFloatingInfoCard = ({ cat }) => {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 shadow-[0_3px_12px_rgba(0,0,0,0.08)] px-4 py-3 text-center transition-all duration-500 group-hover:-translate-y-1">
      <h3 className="text-lg font-medium tracking-wide text-gray-900">
        {cat.name}
      </h3>

      {cat.price && (
        <p className="text-sm text-gray-700 mt-1">
          Starting from{" "}
          <span className="font-semibold text-gray-900">₹{cat.price}</span>
        </p>
      )}

      <div className="mt-2   transition-all duration-500 text-gray-800 text-xs font-medium tracking-wide">
        Explore Collection →
      </div>
    </div>
  );
};

export default CategoryFloatingInfoCard;
