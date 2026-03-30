const EmptyState = ({
  icon = "🛍️",
  title = "No products found",
  description = "Try adjusting your filters or clearing your search.",
  buttonText = "Clear Filters",
  buttonColor = "#da127d",
  onAction,
  showButton = true,
}) => {
  // icon can be an emoji string OR a React node (e.g. <img />)
  const isNode = typeof icon !== "string";

  return (
    <div className="flex flex-col items-center justify-center py-32 text-center gap-4 border border-gray-100 bg-gray-50">
      {isNode ? (
        <div className="mb-2">{icon}</div>
      ) : (
        <span className="text-4xl mb-2">{icon}</span>
      )}

      <p className="text-[14px] font-bold uppercase tracking-widest text-black">
        {title}
      </p>

      <p className="text-[12px] text-gray-500">{description}</p>

      {showButton && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-8 py-3.5 text-[11px] font-bold uppercase tracking-widest text-white hover:bg-black transition-colors shadow-lg"
          style={{ background: buttonColor }}>
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
