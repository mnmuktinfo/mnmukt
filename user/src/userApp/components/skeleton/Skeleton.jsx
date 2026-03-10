const BannerSkeleton = () => (
  <div className="h-[60vh] bg-gray-100 animate-pulse" />
);

const SimpleBlockSkeleton = ({ height }) => (
  <div className={`${height} bg-gray-100 animate-pulse`} />
);

const SectionSkeleton = () => (
  <div className="px-4 py-10 animate-pulse">
    <div className="h-6 bg-gray-200 w-40 mb-6 rounded" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-48 bg-gray-100 rounded-lg" />
      ))}
    </div>
  </div>
);
