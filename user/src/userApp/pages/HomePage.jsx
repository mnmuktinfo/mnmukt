import React, { Suspense, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";

import { useHomepageProducts } from "../../userApp/features/homepage/hooks/useHomepageProducts";
import { productSections } from "../../userApp/features/homepage/config/productCollection";

import {
  HeroSkeleton,
  GridSectionSkeleton,
  CategoriesSkeleton,
  CollectionGridSkeleton,
  TestimonialsSkeleton,
} from "../homepage/HomeSkeletons";

import VideoSection from "../homepage/VideoSection";
import PriceCategories from "../homepage/PriceCategories";
import ExploreOurPicks from "../homepage/ExploreOurPicks";
import EthnicWearHero from "../homepage/EthnicWearHero";
import LuxuryEthnicHero from "../homepage/LuxuryEthnicHero";
import HeroSection from "../homepage/HeroSection";

const CollectionBanner = React.lazy(
  () => import("../components/banner/CollectionBanner"),
);
const CategoryScroller = React.lazy(
  () => import("../homepage/CategoryScroller"),
);
const ProductSection = React.lazy(
  () => import("../components/section/ProductSection"),
);
const CollectionGrid = React.lazy(() => import("../homepage/CollectionGrid"));
const TestimonialsSection = React.lazy(
  () => import("../components/section/TestimonialsSection"),
);

// ── Feedback banner — just an img, no Suspense needed ──────────────────────
const FeedbackBanner = () => (
  <div className="w-full bg-[#FAFAFA] py-8 md:py-12 border-y border-gray-100">
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10">
      <img
        src="https://objst0r.thesouledstore.com/mobile-cms-media-prod/feedback-images/430X55_V2_copy_1_vdJw80a_Bai9WOu.jpg"
        alt="Feedback Banner"
        loading="lazy" // ✅ real lazy loading — browser handles this natively
        className="w-full h-auto object-cover rounded-md shadow-sm"
      />
    </div>
  </div>
);

// ── Scroll reveal — useEffect only, no memo (children always new ref anyway) ─
const Reveal = ({ children, delay = 0 }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.remove("opacity-0", "translate-y-12");
          el.classList.add("opacity-100", "translate-y-0");
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className="transition-all duration-700 ease-out opacity-0 translate-y-12">
      {children}
    </div>
  );
};

// ── Sections config — defined outside component, never changes ───────────────
// ✅ No useMemo needed — this is just a static array slice
const featuredSection = productSections[0];
const remainingSections = productSections.slice(1);

// ─────────────────────────────────────────────────────────────────────────────

const HomePage = () => {
  const {
    products: homeProducts = {},
    categories = [],
    testimonials = [],
    collections: collectionItems = [],
    // ✅ Use granular loading states instead of single `loading` boolean
    loadingKeys,
    categoriesLoading,
    testimonialsLoading,
    collectionsLoading,
  } = useHomepageProducts(productSections);

  return (
    <main className="w-full min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden selection:bg-[#da127d] selection:text-white">
      <Helmet>
        <title>Libas — Official Store | Premium Ethnic Wear</title>
        <meta
          name="description"
          content="Discover premium intricately crafted Salwar Suits, Kurta sets, and lifestyle products at Libas."
        />
      </Helmet>
      {/* ── Hero — above fold, no Reveal animation ── */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>
      {/* ── Categories — uses its own loading state ── */}
      <Reveal>
        <Suspense fallback={<CategoriesSkeleton />}>
          <CategoryScroller
            categories={categories}
            loading={categoriesLoading}
          />
        </Suspense>
      </Reveal>
      <Suspense fallback={<HeroSkeleton />}>
        <EthnicWearHero />
      </Suspense>
      <Reveal>
        <VideoSection /> {/* no Suspense — not lazy loaded */}
      </Reveal>
      <Reveal>
        <PriceCategories />
      </Reveal>
      <Reveal>
        <FeedbackBanner />
      </Reveal>
      <Reveal>
        <ExploreOurPicks />
      </Reveal>
      <LuxuryEthnicHero /> {/* above fold enough — no Reveal */}
      {/* ── Featured product section ── */}
      {featuredSection && (
        <Reveal>
          <Suspense fallback={<GridSectionSkeleton />}>
            <ProductSection
              title={featuredSection.title}
              subtitle={featuredSection.subtitle}
              products={homeProducts[featuredSection.key] ?? []}
              loading={loadingKeys.includes(featuredSection.key)}
            />
          </Suspense>
        </Reveal>
      )}
      {/* ── Collections ── */}
      <Reveal>
        <div className="w-full pb-16">
          <Suspense fallback={<CollectionGridSkeleton />}>
            <CollectionGrid
              title="Shop by Collection"
              items={collectionItems}
              loading={collectionsLoading}
            />
          </Suspense>
        </div>
      </Reveal>
      {/* ── Collection banner ── */}
      <Reveal>
        <Suspense
          fallback={
            <div className="h-[60vh] w-full bg-gray-100 animate-pulse" />
          }>
          <CollectionBanner />
        </Suspense>
      </Reveal>
      {/* ── Remaining product sections ── */}
      {remainingSections.map((section) => (
        <Reveal key={section.key}>
          <Suspense fallback={<GridSectionSkeleton />}>
            <ProductSection
              title={section.title}
              subtitle={section.subtitle}
              products={homeProducts[section.key] ?? []}
              loading={loadingKeys.includes(section.key)}
            />
          </Suspense>
        </Reveal>
      ))}
      {/* ── Testimonials ── */}
      <Reveal>
        <Suspense fallback={<TestimonialsSkeleton />}>
          <TestimonialsSection
            testimonials={testimonials}
            loading={testimonialsLoading}
          />
        </Suspense>
      </Reveal>
    </main>
  );
};

export default HomePage;
