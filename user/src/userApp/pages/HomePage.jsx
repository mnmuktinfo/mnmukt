import React, { Suspense, useEffect, useRef, useState } from "react";
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

/* ---------- Lazy Components ---------- */

const HeroSection = React.lazy(() => import("../homepage/HeroSection"));
const EthnicWearHero = React.lazy(() => import("../homepage/EthnicWearHero"));
const LuxuryEthnicHero = React.lazy(
  () => import("../homepage/LuxuryEthnicHero"),
);

const VideoSection = React.lazy(() => import("../homepage/VideoSection"));
const PriceCategories = React.lazy(() => import("../homepage/PriceCategories"));
const ExploreOurPicks = React.lazy(() => import("../homepage/ExploreOurPicks"));

const CategoryScroller = React.lazy(
  () => import("../homepage/CategoryScroller"),
);
const CollectionGrid = React.lazy(() => import("../homepage/CollectionGrid"));

const ProductSection = React.lazy(
  () => import("../components/section/ProductSection"),
);

const TestimonialsSection = React.lazy(
  () => import("../components/section/TestimonialsSection"),
);

const CollectionBanner = React.lazy(
  () => import("../components/banner/CollectionBanner"),
);

/* ---------- Mobile Detection ---------- */

const useIsMobile = () => {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, []);

  return mobile;
};

/* ---------- Viewport Loader (Progressive Rendering) ---------- */

const ViewportLoader = ({ children, rootMargin = "250px" }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { rootMargin },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return <div ref={ref}>{visible ? children : null}</div>;
};

/* ---------- Feedback Banner ---------- */

const FeedbackBanner = () => (
  <div className="w-full bg-[#FAFAFA] py-8 md:py-12 border-y border-gray-100">
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10">
      <img
        src="https://objst0r.thesouledstore.com/mobile-cms-media-prod/feedback-images/430X55_V2_copy_1_vdJw80a_Bai9WOu.jpg"
        alt="Feedback Banner"
        loading="lazy"
        decoding="async"
        className="w-full h-auto object-cover rounded-md shadow-sm"
      />
    </div>
  </div>
);

/* ---------- Sections Config ---------- */

const featuredSection = productSections[0];
const remainingSections = productSections.slice(1);

/* ========================================================= */

const HomePage = () => {
  const isMobile = useIsMobile();

  const {
    products: homeProducts = {},
    categories = [],
    testimonials = [],
    collections: collectionItems = [],
    loadingKeys,
    categoriesLoading,
    testimonialsLoading,
    collectionsLoading,
  } = useHomepageProducts(productSections);

  /* Reduce products on mobile */

  const getProducts = (key) => {
    const items = homeProducts[key] ?? [];
    return isMobile ? items.slice(0, 4) : items;
  };

  return (
    <main className="w-full min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden selection:bg-[#da127d] selection:text-white">
      <Helmet>
        <title>Mnmukt — Official Store | Premium Ethnic Wear</title>
        <meta
          name="description"
          content="Discover premium intricately crafted Salwar Suits, Kurta sets, and lifestyle products at Mnmukt."
        />
      </Helmet>

      {/* ---------- HERO ---------- */}

      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>

      {/* ---------- CATEGORIES ---------- */}

      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoryScroller categories={categories} loading={categoriesLoading} />
      </Suspense>

      {/* ---------- ETHNIC HERO ---------- */}

      <ViewportLoader>
        <Suspense fallback={<HeroSkeleton />}>
          <EthnicWearHero />
        </Suspense>
      </ViewportLoader>

      {/* ---------- DESKTOP ONLY VISUAL SECTIONS ---------- */}

      {!isMobile && (
        <ViewportLoader>
          <Suspense fallback={<HeroSkeleton />}>
            <VideoSection />
          </Suspense>
        </ViewportLoader>
      )}

      {!isMobile && (
        <ViewportLoader>
          <Suspense fallback={<HeroSkeleton />}>
            <PriceCategories />
          </Suspense>
        </ViewportLoader>
      )}

      <ViewportLoader>
        <FeedbackBanner />
      </ViewportLoader>

      {!isMobile && (
        <ViewportLoader>
          <Suspense fallback={<HeroSkeleton />}>
            <ExploreOurPicks />
          </Suspense>
        </ViewportLoader>
      )}

      {!isMobile && (
        <ViewportLoader>
          <Suspense fallback={<HeroSkeleton />}>
            <LuxuryEthnicHero />
          </Suspense>
        </ViewportLoader>
      )}

      {/* ---------- FEATURED PRODUCTS ---------- */}

      {featuredSection && (
        <ViewportLoader>
          <Suspense fallback={<GridSectionSkeleton />}>
            <ProductSection
              title={featuredSection.title}
              subtitle={featuredSection.subtitle}
              products={getProducts(featuredSection.key)}
              loading={loadingKeys.includes(featuredSection.key)}
            />
          </Suspense>
        </ViewportLoader>
      )}

      {/* ---------- COLLECTION GRID ---------- */}

      <ViewportLoader>
        <Suspense fallback={<CollectionGridSkeleton />}>
          <CollectionGrid
            title="Shop by Collection"
            items={collectionItems}
            loading={collectionsLoading}
          />
        </Suspense>
      </ViewportLoader>

      {/* ---------- COLLECTION BANNER ---------- */}

      {!isMobile && (
        <ViewportLoader>
          <Suspense
            fallback={<div className="h-[60vh] bg-gray-100 animate-pulse" />}>
            <CollectionBanner />
          </Suspense>
        </ViewportLoader>
      )}

      {/* ---------- REMAINING PRODUCT SECTIONS ---------- */}

      {remainingSections.map((section) => (
        <ViewportLoader key={section.key}>
          <Suspense fallback={<GridSectionSkeleton />}>
            <ProductSection
              title={section.title}
              subtitle={section.subtitle}
              products={getProducts(section.key)}
              loading={loadingKeys.includes(section.key)}
            />
          </Suspense>
        </ViewportLoader>
      ))}

      {/* ---------- TESTIMONIALS ---------- */}

      <ViewportLoader>
        <Suspense fallback={<TestimonialsSkeleton />}>
          <TestimonialsSection
            testimonials={testimonials}
            loading={testimonialsLoading}
          />
        </Suspense>
      </ViewportLoader>
    </main>
  );
};

export default HomePage;
