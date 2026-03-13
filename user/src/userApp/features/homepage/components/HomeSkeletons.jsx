import React from "react";

export const HeroSkeleton = () => (
  <div className="w-full h-[60vh] bg-gray-100 animate-pulse" />
);

export const GridSectionSkeleton = () => (
  <div className="w-full py-16 px-4 md:px-10 animate-pulse">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-60 bg-gray-200 rounded-lg" />
      ))}
    </div>
  </div>
);

export const CategoriesSkeleton = () => (
  <div className="w-full py-16 px-4 md:px-10 animate-pulse">
    <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-24 w-24 bg-gray-200 rounded-full mx-auto" />
      ))}
    </div>
  </div>
);

export const CollectionGridSkeleton = () => (
  <div className="w-full py-16 px-4 md:px-10 animate-pulse">
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-72 bg-gray-200 rounded-lg" />
      ))}
    </div>
  </div>
);

export const TestimonialsSkeleton = () => (
  <div className="w-full py-20 animate-pulse">
    <div className="grid md:grid-cols-3 gap-10">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 rounded" />
      ))}
    </div>
  </div>
);
