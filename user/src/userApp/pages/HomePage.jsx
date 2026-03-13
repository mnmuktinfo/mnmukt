import React, { Suspense, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";

import { useHomepageProducts } from "../../userApp/features/homepage/hooks/useHomepageProducts";
import { useFirebaseCollection } from "../features/collection/hook/useItemCollection";
import { useCategories } from "../features/category/hooks/useCategory";
import { productSections } from "../../userApp/features/homepage/config/productCollection";

import {
  HeroSkeleton,
  GridSectionSkeleton,
  CategoriesSkeleton,
  CollectionGridSkeleton,
  TestimonialsSkeleton,
} from "../../userApp/features/homepage/components/HomeSkeletons";
import useTestimonials from "../features/testimonials/hooks/useTestimonials";
import VideoSection from "../components/section/VideoSection";

// Lazy Components
const HeroBanner = React.lazy(() => import("../components/banner/HeroBanner"));
const CollectionBanner = React.lazy(
  () => import("../components/banner/CollectionBanner"),
);
const CategoriesSection = React.lazy(
  () => import("../components/section/CategoriesSection"),
);
const FeaturedCollectionSection = React.lazy(
  () => import("../components/section/FeaturedCollectionSection"),
);
const ProductSection = React.lazy(
  () => import("../components/section/ProductSection"),
);
const CollectionGrid = React.lazy(
  () => import("../components/cards/CollectionGrid"),
);
const TestimonialsSection = React.lazy(
  () => import("../components/section/TestimonialsSection"),
);

// Skeleton placeholder while image loads
const ImageSkeleton = () => (
  <div className="w-full h-20 bg-gray-200 animate-pulse" />
);

// Lazy-loaded image component
const LazyImage = React.lazy(() =>
  Promise.resolve({
    default: () => (
      <img
        src="https://objst0r.thesouledstore.com/mobile-cms-media-prod/feedback-images/430X55_V2_copy_1_vdJw80a_Bai9WOu.jpg"
        alt="Feedback Banner"
        className="w-full h-auto object-cover"
      />
    ),
  }),
);
/* ─────────────────────────────────────────────────────────────
   Scroll-reveal wrapper using Tailwind classes
───────────────────────────────────────────────────────────── */
const Reveal = ({ children, delay = "delay-0" }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.remove("opacity-0", "translate-y-8");
          el.classList.add("opacity-100", "translate-y-0");
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }, // Triggers when 10% of the element is visible
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out opacity-0 translate-y-8 ${delay}`}>
      {children}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   HomePage
───────────────────────────────────────────────────────────── */
const HomePage = () => {
  const { products: homeProducts, loading: productsLoading } =
    useHomepageProducts(productSections);

  const { testimonials, loading } = useTestimonials();
  const { items: collectionItems } = useFirebaseCollection("itemsCollection");
  const { categories, loading: categoriesLoading } = useCategories();

  const featuredSection = productSections[0];
  const remainingSections = productSections.slice(1);

  return (
    <main className="md:mx-4  px-2 min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      <Helmet>
        <title>Mnmukt — Official Store</title>
        <meta
          name="description"
          content="Discover premium fashion and lifestyle products at Mnmukt."
        />
      </Helmet>

      {/* 1. HERO — Instantly visible, no reveal delay */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroBanner />
      </Suspense>

      <Suspense fallback={<ImageSkeleton />}>
        <LazyImage />
      </Suspense>

      <Suspense fallback={<GridSectionSkeleton />}>
        <VideoSection />
      </Suspense>
      <CategoriesSection categories={categories} />

      {/* 3. NEW ARRIVALS / FEATURED SECTION */}
      {featuredSection && (
        <div className="w-full pt-8 md:pt-16">
          <Reveal>
            <Suspense fallback={<GridSectionSkeleton />}>
              <ProductSection
                title={featuredSection.title}
                subtitle={featuredSection.subtitle}
                products={homeProducts[featuredSection.key] || []}
                loading={productsLoading}
              />
            </Suspense>
          </Reveal>
        </div>
      )}

      {/* 4. SPLIT COLLECTION BANNER */}
      <div className="w-full pt-10 md:pt-20 pb-4 md:pb-8">
        <Reveal>
          <Suspense
            fallback={<div className="h-[500px] bg-gray-100 animate-pulse" />}>
            <CollectionBanner />
          </Suspense>
        </Reveal>
      </div>

      {/* 5. REMAINING PRODUCT SECTIONS */}
      {remainingSections.map((section, idx) => (
        <div key={section.key} className="w-full pt-8 md:pt-16">
          <Reveal>
            <Suspense fallback={<GridSectionSkeleton />}>
              <ProductSection
                title={section.title}
                subtitle={section.subtitle}
                products={homeProducts[section.key] || []}
                loading={productsLoading}
              />
            </Suspense>
          </Reveal>
        </div>
      ))}

      <Reveal>
        <Suspense fallback={<TestimonialsSkeleton />}>
          <TestimonialsSection testimonials={testimonials} loading={loading} />
        </Suspense>
      </Reveal>
      {/* 6. CATEGORIES / COLLECTION GRID */}
      <div className="w-full  ">
        <Reveal>
          <Suspense fallback={<CollectionGridSkeleton />}>
            <CollectionGrid
              title="Shop by Collection"
              items={collectionItems}
            />
          </Suspense>
        </Reveal>
      </div>
    </main>
  );
};

export default HomePage;
