import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useCategories } from "../hooks/Usecategories";
import ErrorState from "../../p/components/ErrorState";
import { SkeletonCard } from "../../p/components/SkeletonCard ";
import EmptyState from "../../p/components/EmptyState";
import Breadcrumb from "../../p/components/Breadcrumb";

/* ─────────────────────────── Category Card ────────────────────────── */
const CategoryCard = ({ category, index, onHover }) => {
  const href = `/category/${category.slug || category.id}`;

  return (
    <Link
      to={href}
      onMouseEnter={() => onHover(category.id)}
      className="group flex flex-col items-center gap-3 cursor-pointer"
      style={{ animationDelay: `${index * 60}ms` }}>
      {/* Image */}
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-gray-100">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl select-none bg-gray-50">
            {category.icon || "🛍️"}
          </div>
        )}

        {category.productCount > 0 && (
          <span className="absolute top-2 right-2 z-20 bg-white text-[10px] font-medium text-gray-600 px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {category.productCount}+ items
          </span>
        )}
      </div>

      {/* Text */}
      <div className="text-center">
        <p className="text-[11px] uppercase tracking-[0.12em] font-medium text-[#1a1a1a] group-hover:text-[#da127d] transition-colors duration-300">
          {category.name}
        </p>
        {category.description && (
          <p className="mt-0.5 text-[11px] text-gray-400 line-clamp-1 font-light tracking-wide">
            {category.description}
          </p>
        )}
      </div>
    </Link>
  );
};

/* ─────────────────────────── Skeleton ────────────────────────── */
const CategorySkeleton = () => (
  <div className="flex flex-col items-center gap-3 animate-pulse">
    <div className="w-full aspect-[4/5] bg-gray-100" />
    <div className="h-2.5 w-2/3 bg-gray-200" />
    <div className="h-2 w-1/2 bg-gray-100" />
  </div>
);

/* ─────────────────────────── Main Page ────────────────────────── */
const CategoriesPage = () => {
  const navigate = useNavigate();
  const { categories, isLoading, isFetching, isError, refetch, prefetchById } =
    useCategories();
  const [search, setSearch] = useState("");

  /* Only show active categories on the storefront */
  const active = categories?.filter((c) => c.isActive) || [];

  const filtered = search.trim()
    ? active.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : active;

  // Breadcrumbs
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Collections", href: "/categories" },
  ];

  // JSON-LD Structured Data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Shop by Category — Mnmukt",
    description:
      "Browse all categories — Salwar Suits, Kurta Sets, Dupattas and more at Mnmukt.",
    url: "https://mnmukt.com/categories",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: active.map((cat, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://mnmukt.com/category/${cat.slug || cat.id}`,
      })),
    },
  };

  return (
    <main className="w-full min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* ── SEO ── */}
      <Helmet>
        <title>Shop by Category — Mnmukt</title>
        <meta
          name="description"
          content="Browse all categories — Salwar Suits, Kurta Sets, Dupattas and more at Mnmukt."
        />
        <link rel="canonical" href="https://mnmukt.com/categories" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mnmukt.com/categories" />
        <meta property="og:title" content="Shop by Category — Mnmukt" />
        <meta
          property="og:description"
          content="Browse all categories — Salwar Suits, Kurta Sets, Dupattas and more at Mnmukt."
        />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="Shop by Category — Mnmukt" />
        <meta
          property="twitter:description"
          content="Browse all categories — Salwar Suits, Kurta Sets, Dupattas and more at Mnmukt."
        />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* Refetch bar */}
      {isFetching && !isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-gray-100 overflow-hidden">
          <div className="h-full w-1/3 bg-[#da127d] animate-[slide_1.2s_ease-in-out_infinite]" />
        </div>
      )}

      {/* ── SECTION (matches ProductSection wrapper) ── */}
      <section className="max-w-[1600px] py-5 md:py-10 mx-auto px-4 sm:px-6 lg:px-10">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* ── HEADER (matches ProductSection header style) ── */}
        <div className="flex flex-col items-center text-center mb-5 md:mb-10">
          <h1 className="text-[20px] md:text-[25px] font-medium text-[#1a1a1a] tracking-[0.01em] leading-tight">
            Shop by Category
          </h1>
          <p className="mt-2 text-[15px] md:text-[17px] text-[#2b2a2a] font-normal tracking-[0.02em]">
            Explore our curated collections
          </p>

          {/* Search */}
          <div className="relative mt-5 w-full max-w-xs">
            <input
              type="text"
              placeholder="Search categories…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2 border border-gray-200 focus:border-[#da127d] outline-none text-[12px] text-gray-700 placeholder:text-gray-300 bg-white transition-colors duration-200"
            />
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300 w-3.5 h-3.5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>

          {!isLoading && (
            <p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-gray-400 font-light">
              {filtered.length}{" "}
              {filtered.length === 1 ? "collection" : "collections"} available
            </p>
          )}
        </div>

        {/* ── STATES ── */}
        {isError && !isLoading && <ErrorState onRetry={refetch} />}
        {!isLoading && !isError && filtered.length === 0 && <EmptyState />}

        {/* ── GRID (matches ProductSection grid) ── */}
        {!isError && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-14">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <CategorySkeleton key={i} />
                ))
              : filtered.map((cat, i) => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    index={i}
                    onHover={prefetchById}
                  />
                ))}
          </div>
        )}

        {/* ── VIEW ALL BUTTON (matches ProductSection button) ── */}
        {!isLoading && !isError && filtered.length > 8 && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => navigate("/categories")}
              className="px-8 py-3 text-[12px] uppercase tracking-[0.18em] transition-all duration-300 bg-white text-black border border-[#da127d] hover:opacity-90">
              View All Collections
            </button>
          </div>
        )}
      </section>
    </main>
  );
};

export default CategoriesPage;
