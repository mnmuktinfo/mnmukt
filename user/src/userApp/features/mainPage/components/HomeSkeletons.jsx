import React from "react";

export const HeroSkeleton = () => (
  <div
    className="w-full h-[60vh] bg-gray-100 animate-pulse"
    role="status"
    aria-label="Loading hero section"
  />
);

export const CategoriesHeaderSkeleton = () => (
  <div
    className="flex justify-center gap-6 my-6"
    role="status"
    aria-label="Loading categories">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="w-24 h-24 rounded-full bg-gray-200 animate-pulse"
      />
    ))}
  </div>
);
export const GridSectionSkeleton = () => (
  <div
    className="w-full py-16 px-4 md:px-10 animate-pulse"
    role="status"
    aria-label="Loading section">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-60 bg-gray-200 rounded-lg" />
      ))}
    </div>
  </div>
);

export const CategoriesSkeleton = () => (
  <div
    className="w-full py-16 px-4 md:px-10 animate-pulse"
    role="status"
    aria-label="Loading categories">
    <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-24 w-24 bg-gray-200 rounded-full mx-auto" />
      ))}
    </div>
  </div>
);

export const CollectionGridSkeleton = () => (
  <div
    className="w-full py-16 px-4 md:px-10 animate-pulse"
    role="status"
    aria-label="Loading collections">
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-72 bg-gray-200 rounded-lg" />
      ))}
    </div>
  </div>
);

export const TestimonialsSkeleton = () => (
  <div
    className="w-full py-20 animate-pulse"
    role="status"
    aria-label="Loading testimonials">
    <div className="grid md:grid-cols-3 gap-10">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 rounded" />
      ))}
    </div>
  </div>
);

export const VideoSkeleton = () => (
  <div
    className="w-full py-16 px-4 md:px-10 animate-pulse"
    role="status"
    aria-label="Loading video">
    <div className="w-full h-[50vh] bg-gray-200 rounded-lg flex items-center justify-center">
      <div className="h-16 w-16 rounded-full bg-gray-300" />
    </div>
  </div>
);

export const GenericSectionSkeleton = () => (
  <div
    className="w-full py-16 px-4 md:px-10 animate-pulse"
    role="status"
    aria-label="Loading section">
    <div className="h-8 w-1/3 bg-gray-200 rounded mb-4" />
    <div className="h-4 w-1/2 bg-gray-200 rounded mb-10" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-48 bg-gray-200 rounded-lg" />
      ))}
    </div>
  </div>
);

export const SpotlightSkeleton = () => (
  <div
    className="w-full py-16 px-4 md:px-10 animate-pulse"
    role="status"
    aria-label="Loading customer spotlight">
    <div className="h-8 w-1/3 bg-gray-200 rounded mb-10 mx-auto" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
