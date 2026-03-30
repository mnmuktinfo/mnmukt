import { SkeletonCard } from "./SkeletonCard ";

const ProductGridLoader = ({ gridClass, count = 8 }) => {
  return (
    <div className={`grid ${gridClass} gap-x-4 gap-y-10`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

export default ProductGridLoader;
