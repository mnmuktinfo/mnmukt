import React, { Suspense, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useProducts } from "../features/product/hook/useProducts";
import { useFirebaseCollection } from "../features/collection/hook/useItemCollection";
import { useCategories } from "../features/category/hooks/useCategory";

// -----------------------------
// Lazy-loaded components
// -----------------------------
const HeroBanner = React.lazy(() => import("../components/banner/HeroBanner"));
const VideoSection = React.lazy(
  () => import("../components/section/VideoSection"),
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

// -----------------------------
// Skeleton Components
// -----------------------------

const HeroSkeleton = () => (
  <div className="w-full h-[60vh] bg-gray-100 animate-pulse flex items-center justify-center">
    <div className="w-2/3 space-y-4 text-center">
      <div className="h-10 bg-gray-200 rounded w-1/2 mx-auto" />
      <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto" />
      <div className="h-10 bg-gray-300 rounded w-40 mx-auto mt-6" />
    </div>
  </div>
);

const GridSectionSkeleton = () => (
  <div className="w-full py-16 px-4 md:px-10 animate-pulse">
    <div className="h-8 w-48 bg-gray-200 rounded mb-10" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="h-60 bg-gray-200 rounded-lg" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
        </div>
      ))}
    </div>
  </div>
);

const CategoriesSkeleton = () => (
  <div className="w-full py-16 px-4 md:px-10 animate-pulse">
    <div className="h-8 w-40 bg-gray-200 rounded mb-10" />
    <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="text-center space-y-3">
          <div className="h-24 w-24 bg-gray-200 rounded-full mx-auto" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
        </div>
      ))}
    </div>
  </div>
);

const CollectionGridSkeleton = () => (
  <div className="w-full py-16 px-4 md:px-10 animate-pulse">
    <div className="h-8 w-64 bg-gray-200 rounded mb-10" />
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-72 bg-gray-200 rounded-lg" />
      ))}
    </div>
  </div>
);

const TestimonialsSkeleton = () => (
  <div className="w-full py-20 px-4 md:px-10 animate-pulse">
    <div className="text-center mb-16">
      <div className="h-10 w-60 bg-gray-200 mx-auto rounded mb-4" />
      <div className="h-4 w-40 bg-gray-100 mx-auto rounded" />
    </div>

    <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full" />
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-100 rounded w-3/4" />
        </div>
      ))}
    </div>
  </div>
);

// -----------------------------
// Helper
// -----------------------------
const normalizeCollectionTypes = (product) => {
  if (Array.isArray(product.collectionTypes)) return product.collectionTypes;
  if (typeof product.collectionTypes === "string")
    return [product.collectionTypes];
  if (Array.isArray(product.collectionType)) return product.collectionType;
  if (typeof product.collectionType === "string")
    return [product.collectionType];
  return [];
};

const HomePage = () => {
  const collectionName = "itemsCollection";

  const { getProducts, loading: productsLoading } = useProducts();
  const { items: collectionItems } = useFirebaseCollection(collectionName);
  const { categories, loading: categoriesLoading } = useCategories();

  const [homeProducts, setHomeProducts] = useState({});
  const [collection, setCollection] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  const productSections = [
    {
      key: "new-arrivals",
      title: "New Arrivals",
      subtitle: "Fresh styles added this week",
    },
    { key: "basics", title: "Basics", subtitle: "Handpicked just for you" },
    {
      key: "Trends",
      title: "Trends Collection",
      subtitle: "Luxury and elegance",
    },
  ];

  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        const products = await getProducts();
        const grouped = {};
        productSections.forEach((section) => {
          grouped[section.key] = products.filter(
            (product) =>
              product.isActive === true &&
              normalizeCollectionTypes(product).includes(section.key),
          );
        });
        setHomeProducts(grouped);
      } catch (error) {
        console.error("Failed to fetch home products:", error);
      }
    };
    fetchHomeProducts();
  }, [getProducts]);

  useEffect(() => {
    setCollection(collectionItems || []);
  }, [collectionItems]);

  useEffect(() => {
    setAllCategories(categories || []);
  }, [categories]);

  return (
    <div className="min-h-screen bg-white font-sans">
      <Helmet>
        <title>Mnmukt — Luxury Ethnic Wear | Crafted with Love</title>
        <meta
          name="description"
          content="Discover Mnmukt luxury ethnic wear crafted with premium fabrics, elegant designs and thoughtful details."
        />
      </Helmet>

      <Suspense fallback={<HeroSkeleton />}>
        <HeroBanner />
      </Suspense>

      <Suspense fallback={<HeroSkeleton />}>
        <VideoSection />
      </Suspense>

      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoriesSection
          categories={allCategories}
          loading={categoriesLoading}
        />
      </Suspense>

      {productSections.map((section) => (
        <Suspense
          key={`featured-${section.key}`}
          fallback={<GridSectionSkeleton />}>
          <FeaturedCollectionSection
            title={section.title}
            products={homeProducts[section.key] || []}
            loading={productsLoading}
          />
        </Suspense>
      ))}

      {productSections.map((section) => (
        <Suspense
          key={`product-${section.key}`}
          fallback={<GridSectionSkeleton />}>
          <ProductSection
            title={section.title}
            subtitle={section.subtitle}
            products={homeProducts[section.key] || []}
            loading={productsLoading}
          />
        </Suspense>
      ))}

      <Suspense fallback={<CollectionGridSkeleton />}>
        <CollectionGrid title="SHOP BY COLLECTIONS" items={collection} />
      </Suspense>

      <Suspense fallback={<TestimonialsSkeleton />}>
        <TestimonialsSection />
      </Suspense>
    </div>
  );
};

export default HomePage;
