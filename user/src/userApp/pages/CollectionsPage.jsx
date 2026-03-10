import React from "react";
import CollectionCategories from "../components/CollectionCategories";
import BannerImage from "../code/banner/BannerImage";
// import CollectionTopBar from "../components/common/bars/CollectionTopBar";
import MostLovedStyles from "../code/section/MostLovedSection";

const CollectionPage = () => {
  return (
    <div className="mt-15 pb-16 bg-white">
      <BannerImage
        image="https://shopmulmul.com/cdn/shop/files/4_2b36826c-50b4-4119-9e5e-338e5a58f3b2.jpg?v=1761894404&width=2000"
        height="80vh"
      />
      <CollectionCategories />

      <MostLovedStyles />
      {/* Top category bubble row */}
      {/* <CollectionTopBar
        onFilterChange={(v) => console.log("Filter:", v)}
        onSortChange={(v) => console.log("Sort:", v)}
      /> */}

      {/* Filter + Sort */}
      {/* <FilterSortBar /> */}

      {/* Product Grid */}
      {/* <ProductGrid products={products} /> */}

      {/* Most Loved */}
      {/* <MostLoved data={mostLoved} /> */}

      {/* Info Section */}
      {/* <CollectionInfo /> */}
    </div>
  );
};

export default CollectionPage;
