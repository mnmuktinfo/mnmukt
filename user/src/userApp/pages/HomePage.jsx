import React, { Suspense, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";

import { useHomepageProducts } from "../../userApp/features/homepage/hooks/useHomepageProducts";
import { productSections } from "../../userApp/features/homepage/config/productCollection";
import { IMAGES } from "../../assets/images";

import {
  HeroSkeleton,
  GridSectionSkeleton,
  CategoriesSkeleton,
  CollectionGridSkeleton,
  TestimonialsSkeleton,
} from "../homepage/HomeSkeletons";

import RunningBrandTicker from "../homepage/RunningBrandTicker";
import SocialFeed from "../homepage/SocialFeed";
import ScrollToTopButton from "../../shared/components/ScrollToTopButton";

/* ---------- Lazy Components ---------- */
const HeroSection = React.lazy(() => import("../homepage/HeroSection"));
const CustomerSpotlight = React.lazy(
  () => import("../homepage/CustomerSpotlight"),
);

const VideoSection = React.lazy(() => import("../homepage/VideoSection"));
const CategoriesHeader = React.lazy(
  () => import("../homepage/CategoriesHeader"),
);
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

/* ---------- Mobile Detection ---------- */
const useIsMobile = () => {
  const [mobile, setMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return mobile;
};

/* ---------- Viewport Loader ---------- */
const ViewportLoader = ({ children, rootMargin = "250px" }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(ref.current);
        }
      },
      { rootMargin },
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {visible ? children : <div className="min-h-[200px]" />}
    </div>
  );
};

/* ---------- Section Wrapper ---------- */
const Section = ({ children, className = "" }) => (
  <section className={`w-full ${className}`}>{children}</section>
);

/* ---------- Section Split ---------- */
const featuredSection = productSections[0];
const section1 = productSections[1];
const section2 = productSections[2];
const section3 = productSections[3];
const section4 = productSections[4];

/* ============================================================ */
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

  /* ---------- Product Getter ---------- */
  const getProducts = (key) => {
    const items = homeProducts[key] ?? [];
    return isMobile ? items.slice(0, 4) : items;
  };

  const desktopSlides = IMAGES?.hero?.desktopSlides ?? [];
  const mobileSlides = IMAGES?.hero?.mobileSlides ?? [];

  /* ---------- Reusable Section ---------- */
  const renderSection = (section) => {
    if (!section) return null;

    return (
      <Section>
        <Suspense fallback={<GridSectionSkeleton />}>
          <ViewportLoader>
            <ProductSection
              title={section.title}
              subtitle={section.subtitle}
              products={getProducts(section.key)}
              loading={loadingKeys.includes(section.key)}
              buttonClass="border border-[#da127d] text-[#da127d] hover:bg-[#da127d] hover:text-white"
            />
          </ViewportLoader>
        </Suspense>
      </Section>
    );
  };

  return (
    <main className="w-full min-h-screen bg-white text-[#111] overflow-x-hidden selection:bg-pink-600 selection:text-white">
      <Helmet>
        <title>Mnmukt — Official Store | Premium Ethnic Wear</title>
        <meta
          name="description"
          content="Discover premium intricately crafted Salwar Suits, Kurta sets, and lifestyle products at Mnmukt."
        />
      </Helmet>

      {/* HERO */}
      <Section>
        <Suspense fallback={<HeroSkeleton />}>
          <HeroSection
            desktopSlides={desktopSlides}
            mobileSlides={mobileSlides}
          />
        </Suspense>
      </Section>

      {/* HEADER */}
      <Section>
        <Suspense fallback={<HeroSkeleton />}>
          <ViewportLoader>
            <CategoriesHeader />
          </ViewportLoader>
        </Suspense>
      </Section>

      {/* FEATURED */}
      {featuredSection && (
        <Section>
          <Suspense fallback={<GridSectionSkeleton />}>
            <ViewportLoader>
              <ProductSection
                title={featuredSection.title}
                subtitle={featuredSection.subtitle}
                products={getProducts(featuredSection.key)}
                loading={loadingKeys.includes(featuredSection.key)}
                themeColor="#fdf0f5"
              />
            </ViewportLoader>
          </Suspense>
        </Section>
      )}

      {/* COLLECTION GRID */}
      <Section>
        <Suspense fallback={<CollectionGridSkeleton />}>
          <ViewportLoader>
            <CollectionGrid
              title="Shop by Collection"
              subtitle="Discover curated collections crafted for you"
              items={collectionItems}
              loading={collectionsLoading}
            />
          </ViewportLoader>
        </Suspense>
      </Section>

      {/* SECTION 1 */}
      {renderSection(section1)}

      {/* CATEGORY */}
      <Section>
        <Suspense fallback={<CategoriesSkeleton />}>
          <CategoryScroller
            categories={categories}
            loading={categoriesLoading}
            title="Shop By Category"
            subtitle="Excellence that speaks for itself."
          />
        </Suspense>
      </Section>

      {/* SECTION 2 */}
      {renderSection(section2)}

      {/* VIDEO (desktop only) */}
      {!isMobile && (
        <Section>
          <Suspense fallback={<HeroSkeleton />}>
            <ViewportLoader>
              <VideoSection />
            </ViewportLoader>
          </Suspense>
        </Section>
      )}

      {/* SECTION 3 */}
      {renderSection(section3)}

      {/* EXPLORE (desktop only) */}
      {!isMobile && (
        <Section>
          <Suspense fallback={<HeroSkeleton />}>
            <ViewportLoader>
              <ExploreOurPicks />
            </ViewportLoader>
          </Suspense>
        </Section>
      )}

      {/* SECTION 4 */}
      {renderSection(section4)}

      {/* BRAND */}
      <Section className="py-4">
        <RunningBrandTicker />
      </Section>

      {/* CUSTOMER */}
      <Section>
        <Suspense fallback={<HeroSkeleton />}>
          <ViewportLoader>
            <CustomerSpotlight />
          </ViewportLoader>
        </Suspense>
      </Section>

      {/* SOCIAL */}
      <Section>
        <SocialFeed />
      </Section>

      {/* TESTIMONIALS */}
      <Section className="pb-16">
        <Suspense fallback={<TestimonialsSkeleton />}>
          <ViewportLoader>
            <TestimonialsSection
              testimonials={testimonials}
              loading={testimonialsLoading}
            />
          </ViewportLoader>
        </Suspense>
      </Section>
      <ScrollToTopButton />
    </main>
  );
};

export default HomePage;
