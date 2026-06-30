import React from "react";

// Utility to slugify
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/₹/g, "rs")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const HtmlSitemap = () => {
  const collections = [
    "All",
    "Artsy",
    "Basic Dresses",
    "Basics",
    "Basics Co-Ords",
    "Basics Dresses",
    "Basics Shirts",
    "Basics Tops",
    "Below ₹1000",
    "Below ₹1500",
    "Below ₹2000",
    "Below ₹2500",
    "Bestsellers",
    "Bottoms",
    "Co-Ord Sets",
    "Dresses",
    "Jackets",
    "New Arrivals",
  ];

  const blogPosts = [
    "Co-Ord Sets For Work: The Outfit That Just Makes Life Easier",
    "Summer Wear Dress For Women: The Kind Of Styles You'll Reach For On Repeat",
    "Stylish Office Wear Women: Easy, Polished Picks For Everyday Workdays",
    "Basic Clothes For Women: The Pieces You End Up Loving The Most",
    "How To Style Handwoven Cotton Dresses For Every Occasion",
    "Style Co-Ord Sets: The Kind Of Outfit You Reach For Without Thinking",
    "Styling Tops For Women: Clothes That Fit Into Real Life",
    "Valentine's Day Gift Ideas For Her: Clothes She'll Actually Wear",
    "Shirts For Women: The Ones You Wear Without Thinking",
    "Top For Women: Easy Styles You'll Actually Want To Wear",
    "Best Beachwear Dresses For Women: Easy, Breezy & Made For Real Days",
    "Co-Ord Set For Women: When Getting Dressed Stops Feeling Complicated",
    "How To Wear A Crop Top For Every Body Type",
    "Top 10 Summer Wear Dresses For A Chic & Breezy Look",
  ];

  const products = [
    "Royal Black Cotton Straight Pants",
    "Turquoise Ombre Shirt",
    "Pistachio Green Embroidered Top",
    "Pastel Green Mirror Work Top",
    "Tangerine Embroidered Top",
    "Artsy Khadi Sassy Jacket",
    "Caramel Brown Co-Ord Set",
    "Leafy Green Dress",
    "Mystic Mehndi Weave Dress",
    "Royal Black Cotton Palazzo",
    "Evening Blue Strappy Dress",
    "Spider Black Shirt",
    "Solid Grey Sleeveless Dress",
    "Navy Blue Top With Inner",
    "Oxford Blue Dress",
    "Salted Lime Dress",
    "Egyptian Blue Co-Ord Set",
    "Muted Red Co-Ord Set",
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 bg-white text-gray-900">
      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SiteNavigationElement",
            name: "HTML Sitemap",
            url: "https://yourdomain.com/sitemap",
          }),
        }}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-sm text-gray-600 mb-8">
        <a href="/" className="hover:underline">
          Home
        </a>{" "}
        / <span>HTML Sitemap</span>
      </nav>

      {/* Title */}
      <header className="text-center mb-12">
        <h1 className="text-3xl font-bold uppercase tracking-wide">
          HTML Sitemap
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          Browse all collections, blogs, and products
        </p>
      </header>

      {/* Grid */}
      <div className="grid md:grid-cols-3 gap-12">
        {/* Collections */}
        <section>
          <h2 className="text-xl font-semibold mb-6">Shop Collections</h2>
          <ul className="space-y-3">
            {collections.map((item, i) => (
              <li key={i}>
                <a
                  href={`/collections/${slugify(item)}`}
                  className="text-gray-700 hover:text-black hover:underline">
                  {item} Collection
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Blogs */}
        <section>
          <h2 className="text-xl font-semibold mb-6">Fashion Blog</h2>
          <ul className="space-y-3">
            {blogPosts.map((item, i) => (
              <li key={i}>
                <a
                  href={`/blog/${slugify(item)}`}
                  className="text-gray-700 hover:text-black hover:underline leading-relaxed">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Products */}
        <section>
          <h2 className="text-xl font-semibold mb-6">Popular Products</h2>
          <ul className="space-y-3">
            {products.map((item, i) => (
              <li key={i}>
                <a
                  href={`/product/${slugify(item)}`}
                  className="text-gray-700 hover:text-black hover:underline">
                  Buy {item} Online
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
};

export default HtmlSitemap;
