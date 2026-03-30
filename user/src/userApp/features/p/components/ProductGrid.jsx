import ProductCard from "../../../components/cards/ProductCard";
import ProductGridLoader from "./ProductGridLoader";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import InfiniteSentinel from "./InfiniteSentinel";
import { SkeletonCard } from "./SkeletonCard ";

const ProductGrid = ({
  isLoading,
  isError,
  displayProducts,
  gridClass,
  isFetchingNextPage,
  hasNextPage,
  sentinelRef,
  clearFilters,
}) => {
  if (isError) return <ErrorState retry={() => window.location.reload()} />;

  if (isLoading) return <ProductGridLoader gridClass={gridClass} />;

  if (displayProducts.length === 0)
    return <EmptyState clearFilters={clearFilters} />;

  return (
    <>
      <div
        className={`grid ${gridClass} gap-x-4 sm:gap-x-6 gap-y-10 lg:gap-y-14`}>
        {displayProducts.map((product, i) => (
          <div
            key={product.id}
            style={{
              animation: "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both",
              animationDelay: `${Math.min(i % 8, 7) * 40}ms`,
            }}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {isFetchingNextPage && (
        <div
          className={`grid ${gridClass} gap-x-4 sm:gap-x-6 gap-y-10 lg:gap-y-14 mt-10`}>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      <InfiniteSentinel sentinelRef={sentinelRef} />

      {!hasNextPage && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center gap-4 w-full">
            <div className="h-px w-16 bg-gray-300" />
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">
              End of Collection
            </p>
            <div className="h-px w-16 bg-gray-300" />
          </div>
        </div>
      )}
    </>
  );
};

export default ProductGrid;
