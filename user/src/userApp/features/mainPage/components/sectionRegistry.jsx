import React from "react";
import {
  HeroSkeleton,
  CategoriesSkeleton,
  CollectionGridSkeleton,
  TestimonialsSkeleton,
  VideoSkeleton,
  GenericSectionSkeleton,
  SpotlightSkeleton,
  CategoriesHeaderSkeleton,
} from "./HomeSkeletons";

/**
 * JSDoc definitions give you type-safety and IDE autocomplete without needing full TypeScript
 *
 * @typedef {Object} RegistryItem
 * @property {React.LazyExoticComponent} Component
 * @property {React.FC} skeleton
 * @property {function(Object, Object): Object} mapProps
 */

/** @type {Record<string, RegistryItem>} */
export const CUSTOM_COMPONENT_REGISTRY = {
  hero: {
    Component: React.lazy(() => import("./HeroSection")),
    skeleton: HeroSkeleton,
    mapProps: (data) => ({
      desktopSlides: data?.desktop ?? [],
      mobileSlides: data?.mobile ?? [],
    }),
  },

  categoriesHeader: {
    Component: React.lazy(() => import("./CategoriesHeader")),
    skeleton: CategoriesHeaderSkeleton,
    mapProps: (data) => ({
      items: data?.items ?? [],
    }),
  },

  collectionGrid: {
    Component: React.lazy(() => import("./CollectionGrid")),
    skeleton: CollectionGridSkeleton,
    mapProps: (data, shared) => ({
      title: data?.title ?? "Shop by Collection",
      subtitle:
        data?.subtitle ?? "Discover curated collections crafted for you",
      items: shared?.collectionItems ?? [],
      loading: shared?.collectionsLoading ?? false,
    }),
  },

  categoryScroller: {
    Component: React.lazy(() => import("./CategoryScroller")),
    skeleton: CategoriesSkeleton,
    mapProps: (data, shared) => ({
      title: data?.title ?? "Shop By Category",
      subtitle: data?.subtitle ?? "Excellence that speaks for itself.",
      categories: shared?.categories ?? [],
      loading: shared?.categoriesLoading ?? false,
    }),
  },

  videoSection: {
    Component: React.lazy(() => import("./VideoSection")),
    skeleton: VideoSkeleton,
    mapProps: (data) => ({
      videoUrl: data?.videoUrl ?? "",
      posterImage: data?.posterImage ?? "",
    }),
  },

  exploreOurPicks: {
    Component: React.lazy(() => import("./ExploreOurPicks")),
    skeleton: GenericSectionSkeleton,
    mapProps: (data, shared) => ({
      title: data?.title ?? "Explore Our Picks",
      picks: shared?.picks ?? data?.picks ?? [],
    }),
  },

  customerSpotlight: {
    Component: React.lazy(() => import("./CustomerSpotlight")),
    skeleton: SpotlightSkeleton,
    mapProps: (data) => ({
      heading: data?.heading ?? "Customer Spotlight",
      spotlights: data?.spotlights ?? [],
    }),
  },

  testimonials: {
    Component: React.lazy(() => import("./TestimonialsSection")),
    skeleton: TestimonialsSkeleton,
    mapProps: (data, shared) => ({
      title: data?.title ?? "What Our Customers Say",
      testimonials: shared?.testimonials ?? [],
      loading: shared?.testimonialsLoading ?? false,
    }),
  },
};
