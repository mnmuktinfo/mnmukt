import React, { useEffect, useState } from "react";
import { COLORS } from "../../../../style/theme";
import { Link, useParams } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import axios from "axios";
import { Helmet } from "react-helmet-async";

const CategoryDetails = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const api = ""; // BASE API

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await axios.get(`${api}/category/${slug}`);
        setCategory(catRes.data.category);

        const prodRes = await axios.get(`${api}/products/category/${slug}`);
        setProducts(prodRes.data.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="mt-24">
      {/* ✅ SEO TAGS */}
      <Helmet>
        <title>{category?.seoTitle || category?.name}</title>
        <meta
          name="description"
          content={
            category?.seoDescription ||
            `Explore premium ${category?.name} at the best price.`
          }
        />
        <link
          rel="canonical"
          href={`https://yourwebsite.com/collections/${slug}`}
        />
      </Helmet>

      {/* ✅ BREADCRUMBS */}
      <div className="max-w-6xl mx-auto px-6 py-4 text-sm flex items-center gap-1 text-gray-500">
        <Link to="/" className="hover:underline">
          Home
        </Link>
        <ChevronRight size={14} />
        <Link to="/collections" className="hover:underline">
          Collections
        </Link>
        <ChevronRight size={14} />
        <span className="font-medium text-gray-700">{category?.name}</span>
      </div>

      {/* ✅ HERO BANNER */}
      <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden max-w-6xl mx-auto">
        <img
          src={
            category?.banner ||
            "https://shopmulmul.com/cdn/shop/files/desktop_13.jpg?v=1761292769"
          }
          alt={category?.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* ✅ CATEGORY TITLE + SUBTEXT */}
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1
          className="text-3xl md:text-4xl font-bold mb-4"
          style={{ color: COLORS.primary }}>
          {category?.name}
        </h1>

        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {category?.description ||
            "Discover our premium collection crafted with elegance and comfort."}
        </p>
      </div>

      {/* ✅ FILTER BAR */}
      <div
        className="w-full px-6 sticky top-16 z-40 bg-white border-t border-b py-3 shadow-sm"
        style={{ borderColor: COLORS.secondary + "40" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {products.length} Products Found
          </p>

          <button
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border bg-white hover:bg-gray-50 transition"
            style={{
              borderColor: COLORS.secondary + "40",
              color: COLORS.primary,
            }}>
            Sort by
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* ✅ PRODUCT GRID */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Link
              to={`/product/${product.slug}`}
              key={product._id}
              className="group block">
              {/* Image */}
              <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>

              {/* Title */}
              <h3 className="mt-4 font-medium text-gray-800 group-hover:text-black transition">
                {product.name}
              </h3>

              {/* Price */}
              <p className="text-gray-600 mt-1 text-sm font-medium">
                ₹{product.price.toLocaleString()}
              </p>

              {/* Optional Tag */}
              {product?.tag && (
                <span className="text-xs px-2 py-1 bg-gray-100 mt-2 inline-block rounded-lg text-gray-600">
                  {product.tag}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* ✅ LONG DESCRIPTION / COLLECTION STORY */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h2
          className="text-2xl font-semibold mb-4"
          style={{ color: COLORS.primary }}>
          The Story Behind This Collection
        </h2>

        <p className="text-gray-600 leading-relaxed">
          {category?.longDescription ||
            `Explore the finest craftsmanship and detail in every piece of our collection.
            Designed for comfort and elegance, these styles are perfect for your wardrobe.`}
        </p>
      </div>
    </div>
  );
};

export default CategoryDetails;
