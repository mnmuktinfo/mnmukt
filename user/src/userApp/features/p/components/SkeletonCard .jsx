export const SkeletonCard = () => (
  <div className="animate-pulse flex flex-col gap-3">
    <div className="w-full aspect-3/4 bg-gray-100 border border-gray-100" />
    <div className="space-y-2 px-1">
      <div className="h-2.5 bg-gray-100 w-3/4" />
      <div className="h-2.5 bg-gray-100 w-1/2" />
    </div>
  </div>
);
