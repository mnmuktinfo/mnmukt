const ErrorState = ({ retry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-28 text-center gap-4 border border-gray-100 bg-gray-50">
      <p className="text-[14px] font-bold uppercase tracking-widest text-black">
        Something went wrong
      </p>

      <p className="text-[12px] text-gray-500">
        Could not load products. Please try again.
      </p>

      <button
        onClick={retry}
        className="mt-4 px-8 py-3.5 text-[11px] font-bold uppercase tracking-widest text-white hover:bg-black transition-colors shadow-lg"
        style={{ background: "#da127d" }}>
        Retry
      </button>
    </div>
  );
};

export default ErrorState;
