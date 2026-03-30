import React, { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import { useCollection } from "./Usecollection";

import DesktopSidebar from "./components/DesktopSidebar";
import CollectionToolbar from "./components/CollectionToolbar";
import MobileFilterSheet from "./components/MobileFilterSheet";
import MobileSortSheet from "./components/MobileSortSheet";
import MobileBottomFilterBar from "./components/MobileBottomFilterBar";

import Breadcrumb from "./components/Breadcrumb";
import ActiveChips from "./components/ActiveChips";

// import CollectionHeader from "./components/CollectionHeader";
import CollectionSearch from "./components/CollectionSearch";
import ProductGrid from "./components/ProductGrid";

import { COLLECTION_LABELS, SORT_OPTIONS } from "./constants/filters";

import countActive from "./utils/countActive";
import { readFilters } from "./utils/filterUtils";

const CollectionPage = () => {
  const { collectionType = "all" } = useParams();

  const [sp, setSp] = useSearchParams();
  const filters = useMemo(() => readFilters(sp), [sp]);

  const [sort, setSort] = useState("newest");
  const [gridCols, setGridCols] = useState(4);

  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showSortSheet, setShowSortSheet] = useState(false);

  const {
    displayProducts,
    facets,
    totalFetched,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useCollection({ collectionType, filters, sort });

  /* Infinite Scroll */
  const sentinelRef = useRef(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "500px" },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  /* Body Scroll Lock */
  useEffect(() => {
    document.body.style.overflow =
      showFilterSheet || showSortSheet ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [showFilterSheet, showSortSheet]);

  /* Title */
  const title =
    COLLECTION_LABELS[collectionType] ??
    collectionType.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const filterCnt = countActive(filters);

  const gridClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4",
  }[gridCols];

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to { opacity:1; transform:translateY(0); }
        }
      `}</style>

      <div className="min-h-screen bg-white pb-[80px] lg:pb-20 font-sans selection:bg-[#da127d] selection:text-white">
        {/* Mobile Sheets */}
        {showFilterSheet && (
          <MobileFilterSheet
            facets={facets}
            filters={filters}
            onClose={() => setShowFilterSheet(false)}
            setSp={setSp}
          />
        )}

        {showSortSheet && (
          <MobileSortSheet
            sort={sort}
            onSelect={setSort}
            onClose={() => setShowSortSheet(false)}
          />
        )}

        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: title }]} />

        <div className="flex px-6 lg:px-12 mt-6 lg:mt-10">
          {/* Desktop Sidebar */}
          <DesktopSidebar facets={facets} filters={filters} setSp={setSp} />

          {/* Products Column */}
          <div className="flex-1 min-w-0">
            {/* Desktop Search */}
            <CollectionSearch value={filters.search} sp={sp} setSp={setSp} />

            {/* Desktop Toolbar */}
            <CollectionToolbar
              title={title}
              gridCols={gridCols}
              setGridCols={setGridCols}
              sort={sort}
              setSort={setSort}
            />

            {/* Mobile Search */}
            <CollectionSearch
              mobile
              value={filters.search}
              sp={sp}
              setSp={setSp}
            />

            {/* Active Filters */}
            <ActiveChips filters={filters} />

            {/* Product Grid */}
            <ProductGrid
              isLoading={isLoading}
              isError={isError}
              displayProducts={displayProducts}
              gridClass={gridClass}
              isFetchingNextPage={isFetchingNextPage}
              hasNextPage={hasNextPage}
              sentinelRef={sentinelRef}
              clearFilters={() => setSp({})}
            />
          </div>
        </div>

        {/* Mobile Bottom Filter Bar */}
        <MobileBottomFilterBar
          filterCount={filterCnt}
          sort={sort}
          onOpenFilter={() => setShowFilterSheet(true)}
          onOpenSort={() => setShowSortSheet(true)}
        />
      </div>
    </>
  );
};

export default CollectionPage;
