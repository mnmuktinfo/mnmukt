import React, { useEffect, useRef, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Leaf,
  ShoppingBag,
  Search,
  User,
  Menu,
  X,
  Check,
  ArrowRight,
  Star,
  ChevronLeft,
  ChevronRight,
  Shield,
  Truck,
  RefreshCw,
  Sprout,
  Sparkles,
  Droplets,
  Gift,
} from "lucide-react";

import { useCart } from "../../../context/TaruvedaCartContext";
import { useTaruvedaProducts } from "../hooks/useTaruvedaProducts";
import ProductSection from "../../../components/section/ProductSection";
import HeroSection from "../../../homepage/HeroSection";
import { IMAGES } from "../../../../assets/images";
import CategoryScroller from "../../../homepage/CategoryScroller";
import CollectionGrid from "../../../homepage/CollectionGrid";

const BASE_URL = "/taruveda-organic-shampoo-oil";

/* ════════════════════════════════════════════
   STATIC DATA
════════════════════════════════════════════ */

const STATIC_PRODUCTS = [
  {
    id: "p1",
    name: "Brahmi Scalp Oil",
    category: "Hair Care",
    price: 349,
    mrp: 449,
    image:
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&q=80",
    isBestSeller: true,
  },
  {
    id: "p2",
    name: "Neem Herbal Shampoo",
    category: "Hair Care",
    price: 299,
    mrp: 399,
    image:
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&q=80",
    isBestSeller: true,
  },
  {
    id: "p3",
    name: "Kumkumadi Face Serum",
    category: "Skin Care",
    price: 699,
    mrp: 899,
    image:
      "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&q=80",
    isBestSeller: true,
  },
  {
    id: "p4",
    name: "Amla Growth Elixir",
    category: "Hair Care",
    price: 399,
    mrp: 499,
    image:
      "https://images.unsplash.com/photo-1631390892953-e22c2f658a1e?w=400&q=80",
  },
  {
    id: "p5",
    name: "Rose Glow Moisturiser",
    category: "Skin Care",
    price: 549,
    mrp: 699,
    image:
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80",
  },
  {
    id: "p6",
    name: "Sandalwood Body Scrub",
    category: "Body Care",
    price: 449,
    mrp: 599,
    image:
      "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=400&q=80",
  },
  {
    id: "p7",
    name: "Hair Growth Combo",
    category: "Combos",
    price: 599,
    mrp: 849,
    image:
      "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=400&q=80",
    isBestSeller: true,
  },
  {
    id: "p8",
    name: "Bhringraj Hair Mask",
    category: "Hair Care",
    price: 329,
    mrp: 429,
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80",
  },
];

const COLLECTION_ITEMS = [
  {
    name: "Hair Care",
    tag: "12 products",
    img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80",
  },
  {
    name: "Skin Care",
    tag: "18 products",
    img: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=600&q=80",
  },
  {
    name: "Body Care",
    tag: "10 products",
    img: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80",
  },
  {
    name: "Gift Sets",
    tag: "4 bundles",
    img: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=600&q=80",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya S.",
    city: "Delhi",
    rating: 5,
    product: "Brahmi Hair Oil",
    text: "Hair fall reduced drastically in 3 weeks. Love the natural fragrance — no synthetic scent at all!",
  },
  {
    name: "Ananya R.",
    city: "Mumbai",
    rating: 5,
    product: "Neem Shampoo",
    text: "Finally found a shampoo that doesn't strip my scalp. Hair feels genuinely nourished and shiny.",
  },
  {
    name: "Kavitha M.",
    city: "Bangalore",
    rating: 5,
    product: "Growth Combo",
    text: "The combo pack is incredible value. Both products work beautifully together. Already on my third order!",
  },
  {
    name: "Sunita T.",
    city: "Pune",
    rating: 4,
    product: "Amla Oil",
    text: "Noticed a real difference in scalp health within 2 weeks. Great quality, pure ingredients.",
  },
];

const BENEFITS = [
  { icon: Truck, label: "Free Delivery", sub: "On orders above ₹999" },
  {
    icon: Shield,
    label: "100% Authentic",
    sub: "USDA & India Organic certified",
  },
  { icon: RefreshCw, label: "Easy Returns", sub: "7-day hassle-free returns" },
  { icon: Leaf, label: "Zero Chemicals", sub: "No parabens, sulfates or SLS" },
];

const INGREDIENTS = [
  { name: "Brahmi", benefit: "Strengthens roots", icon: Sprout },
  { name: "Amla", benefit: "Prevents hairfall", icon: Leaf },
  { name: "Neem", benefit: "Soothes scalp", icon: Sparkles },
  { name: "Bhringraj", benefit: "Boosts growth", icon: Droplets },
];

const CATEGORY_PILLS = [
  { label: "Hair Care", icon: Droplets, sub: "Oils, Shampoos & Masks" },
  { label: "Skin Care", icon: Sparkles, sub: "Serums & Moisturisers" },
  { label: "Body Care", icon: Leaf, sub: "Scrubs & Body Oils" },
  { label: "Combos", icon: Gift, sub: "Value Gift Bundles" },
];

/* ════════════════════════════════════════════
   UTILS
════════════════════════════════════════════ */

const useIsMobile = () => {
  const [m, setM] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );
  useEffect(() => {
    const fn = () => setM(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return m;
};

const ViewportLoader = ({
  children,
  rootMargin = "300px",
  fallback = null,
}) => {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVis(true);
          ob.unobserve(el);
        }
      },
      { rootMargin },
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [rootMargin]);
  return <div ref={ref}>{vis ? children : fallback}</div>;
};

/* ════════════════════════════════════════════
   COMPONENT SECTIONS (Receiving `isLoading`)
════════════════════════════════════════════ */

const MarqueeStrip = ({ isLoading }) => {
  if (isLoading)
    return (
      <div className="h-10 bg-[#0f2318] animate-pulse border-b border-[#2C3E30]" />
    );

  const tags = [
    "100% Organic",
    "Ayurvedic Formula",
    "Zero Chemicals",
    "Cold-Pressed Oils",
    "Cruelty Free",
  ];
  return (
    <div className="bg-[#0f2318] py-2.5 overflow-hidden border-b border-[#2C3E30]">
      <div className="flex gap-8 animate-[marquee_25s_linear_infinite] whitespace-nowrap w-max">
        {[...tags, ...tags, ...tags].map((item, i) => (
          <div key={i} className="flex items-center gap-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f7faf5]/90">
              {item}
            </span>
            <Sprout className="w-3 h-3 text-[#7aad5a]" />
          </div>
        ))}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-33.33%); } }`}</style>
    </div>
  );
};

const BenefitsBar = ({ isLoading }) => {
  if (isLoading)
    return (
      <section className="py-8 bg-white border-b border-[#ede9e0]">
        <div className="max-w-[1440px] mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 items-center animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-100 w-2/3 rounded" />
                <div className="h-2 bg-gray-50 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );

  return (
    <section className="py-8 bg-white border-b border-[#ede9e0]">
      <div className="max-w-[1440px] mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-6">
        {BENEFITS.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex items-center gap-4 group">
            <div className="w-10 h-10 bg-[#f7faf5] rounded-full flex items-center justify-center shrink-0 group-hover:bg-[#3a7c23] transition-colors duration-300">
              <Icon className="w-4.5 h-4.5 text-[#3a7c23] group-hover:text-white transition-colors" />
            </div>
            <div>
              <div className="text-xs font-black text-[#0f2318] uppercase tracking-wide">
                {label}
              </div>
              <div className="text-[10px] text-[#9e9080] mt-0.5">{sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const PromoBanner = ({ onShop, isLoading }) => {
  if (isLoading)
    return (
      <div className="max-w-[1440px] mx-auto px-5 py-10">
        <div className="w-full h-48 sm:h-64 bg-gray-100 animate-pulse rounded-2xl" />
      </div>
    );

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-[1440px] mx-auto px-5">
        <div className="bg-[#0f2318] rounded-2xl p-8 md:p-14 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
            }}
          />
          <div className="relative z-10">
            <h2
              className="text-3xl md:text-5xl text-white font-light mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Elevate Your Daily Ritual
            </h2>
            <p className="text-[#f7faf5]/70 text-sm md:text-base max-w-xl mx-auto mb-8 font-light">
              Experience the pure power of Ayurveda with our 100% natural,
              freshly blended organic formulations.
            </p>
            <button
              onClick={onShop}
              className="bg-[#3a7c23] text-white px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-[#2d621b] transition-colors shadow-lg">
              Explore Collection
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const IngredientStory = ({ isLoading }) => {
  if (isLoading)
    return (
      <section className="py-20 bg-[#fefcf8]">
        <div className="max-w-[1440px] mx-auto px-5">
          <div className="w-1/3 h-10 bg-gray-200 mb-8 animate-pulse rounded" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array(4)
              .fill()
              .map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-100 rounded-2xl animate-pulse"
                />
              ))}
          </div>
        </div>
      </section>
    );

  return (
    <section className="py-20 md:py-24 bg-[#fefcf8] border-y border-[#ede9e0]">
      <div className="max-w-[1440px] mx-auto px-5 md:px-10">
        <div className="text-center mb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#7aad5a] block mb-2">
            The TaruVeda Difference
          </span>
          <h2
            className="text-3xl md:text-4xl text-[#0f2318] font-light"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Sourced From Nature's Purest Corners
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {INGREDIENTS.map((ing) => (
            <div
              key={ing.name}
              className="bg-white border border-[#ede9e0] rounded-2xl p-6 text-center hover:border-[#3a7c23]/30 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 mx-auto bg-[#f7faf5] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ing.icon className="w-5 h-5 text-[#3a7c23]" />
              </div>
              <h3 className="text-sm font-bold text-[#0f2318] mb-1">
                {ing.name}
              </h3>
              <p className="text-[11px] text-[#9e9080] leading-relaxed">
                {ing.benefit}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TestimonialsSection = ({ isLoading }) => {
  const [idx, setIdx] = useState(0);
  const isMob = useIsMobile();
  const shown = isMob ? 1 : 2;
  const max = TESTIMONIALS.length - shown;

  if (isLoading)
    return (
      <section className="py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-5">
          <div className="w-1/4 h-8 bg-gray-100 animate-pulse rounded mb-10" />
          <div className="grid md:grid-cols-2 gap-5">
            {Array(shown)
              .fill()
              .map((_, i) => (
                <div
                  key={i}
                  className="h-48 bg-gray-50 rounded-2xl animate-pulse"
                />
              ))}
          </div>
        </div>
      </section>
    );

  return (
    <section className="py-20 md:py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-5 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#7aad5a] block mb-2">
              Customer Stories
            </span>
            <h2
              className="text-3xl md:text-4xl font-light text-[#0f2318]"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Real Results, Real People
            </h2>
          </div>
          <div className="flex gap-2.5">
            {[ChevronLeft, ChevronRight].map((Icon, i) => (
              <button
                key={i}
                onClick={() =>
                  setIdx((v) =>
                    i === 0 ? Math.max(0, v - 1) : Math.min(max, v + 1),
                  )
                }
                disabled={i === 0 ? idx === 0 : idx >= max}
                className="w-12 h-12 rounded-full bg-[#f7faf5] border border-[#ede9e0] flex items-center justify-center text-[#9e9080] hover:border-[#0f2318] hover:text-[#0f2318] transition-all disabled:opacity-30 focus:outline-none">
                <Icon className="w-5 h-5" />
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {TESTIMONIALS.slice(idx, idx + shown).map((t, i) => (
            <div
              key={`${idx}-${i}`}
              className="bg-[#fefcf8] border border-[#ede9e0] rounded-2xl p-7 md:p-8">
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    className={`w-4 h-4 ${si < t.rating ? "fill-[#d4ac3a] text-[#d4ac3a]" : "fill-[#ede9e0] text-[#ede9e0]"}`}
                  />
                ))}
              </div>
              <p className="text-[#4a4035] text-sm md:text-base leading-[1.8] mb-6 italic font-light">
                "{t.text}"
              </p>
              <div className="flex items-center justify-between border-t border-[#ede9e0] pt-5">
                <div>
                  <div className="text-sm font-black text-[#0f2318]">
                    {t.name}
                  </div>
                  <div className="text-[10px] text-[#9e9080] uppercase tracking-wider">
                    {t.city}
                  </div>
                </div>
                <div className="text-[9px] font-black uppercase tracking-widest text-[#3a7c23] bg-[#f7faf5] border border-[#ede9e0] px-3 py-1.5 rounded-full">
                  {t.product}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ════════════════════════════════════════════
   PRODUCT SECTION CONFIG
════════════════════════════════════════════ */

const PRODUCT_SECTIONS = [
  {
    key: "best",
    title: "Our Best Sellers",
    subtitle: "Trending Now",
    filter: (p) => p.isBestSeller,
    fallback: true,
    bg: "bg-[#f7faf5]",
  },
  {
    key: "hair",
    title: "Hair Care Rituals",
    subtitle: "Ayurvedic Hair Wellness",
    filter: (p) => p.category === "Hair Care",
    bg: "bg-white",
  },
  {
    key: "skin",
    title: "Skin Care Essentials",
    subtitle: "Glow Naturally",
    filter: (p) => p.category === "Skin Care",
    bg: "bg-[#f7faf5]",
  },
  {
    key: "body",
    title: "Body Care",
    subtitle: "Nature Powered Body Rituals",
    filter: (p) => p.category === "Body Care",
    bg: "bg-white",
  },
  {
    key: "combos",
    title: "Value Combos",
    subtitle: "Best Bundles",
    filter: (p) => p.category === "Combos",
    bg: "bg-[#f7faf5]",
  },
];

/* ════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════ */

export default function TaruvedaHomePage() {
  const { cart, addToCart } = useCart();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const desktopSlides = IMAGES.taruveda?.heroDesktop ?? [];
  const mobileSlides = IMAGES.taruveda?.heroMobile ?? [];

  const { products: liveProducts, isLoading } = useTaruvedaProducts();

  // Use live products if available, fallback to static if fetching fails or is empty, but maintain loading state visually
  const products = liveProducts?.length ? liveProducts : STATIC_PRODUCTS;

  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const productSections = useMemo(() => {
    return PRODUCT_SECTIONS.map((section) => {
      let sectionProducts = section.filter
        ? filteredProducts.filter(section.filter)
        : filteredProducts;
      if (section.fallback && sectionProducts.length === 0) {
        sectionProducts = filteredProducts;
      }
      const items = isMobile
        ? sectionProducts.slice(0, 4)
        : sectionProducts.slice(0, 8);
      return { ...section, products: items };
    });
  }, [filteredProducts, isMobile]);

  const scrollToProducts = () =>
    document
      .getElementById("tv-products")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="min-h-screen bg-[#fefcf8] font-sans text-[#0f2318] overflow-x-hidden selection:bg-[#3a7c23] selection:text-white">
      <Helmet>
        <title>
          TaruVeda — Organic Hair & Skin Care | Ayurvedic Essentials
        </title>
        <meta
          name="description"
          content="100% organic Ayurvedic hair oils, herbal shampoos and natural skincare."
        />
      </Helmet>

      {/* HERO */}
      <HeroSection
        desktopSlides={desktopSlides}
        mobileSlides={mobileSlides}
        isLoading={isLoading}
      />

      <MarqueeStrip isLoading={isLoading} />

      {/* BENEFITS */}
      <ViewportLoader fallback={<div className="h-24 bg-white" />}>
        <BenefitsBar isLoading={isLoading} />
      </ViewportLoader>

      {/* COLLECTION GRID */}
      <ViewportLoader fallback={<div className="h-80 bg-[#fefcf8]" />}>
        <CollectionGrid items={COLLECTION_ITEMS} isLoading={isLoading} />
      </ViewportLoader>

      {/* CATEGORY PILLS */}
      <ViewportLoader fallback={<div className="h-44 bg-white" />}>
        <CategoryScroller categories={CATEGORY_PILLS} isLoading={isLoading} />
      </ViewportLoader>

      {/* PRODUCT SECTIONS */}
      <div id="tv-products">
        {productSections.map((section) =>
          section.products.length > 0 || isLoading ? (
            <ViewportLoader
              key={section.key}
              fallback={<div className="h-96 bg-[#f7faf5]" />}>
              <ProductSection
                title={section.title}
                subtitle={section.subtitle}
                products={section.products}
                cart={cart}
                addToCart={addToCart}
                loading={isLoading}
                bg={section.bg}
                type="taruveda"
                onViewAll={() => navigate(`${BASE_URL}/shop`)}
              />
            </ViewportLoader>
          ) : null,
        )}
      </div>

      {/* PROMO */}
      <ViewportLoader fallback={<div className="h-40 bg-white" />}>
        <PromoBanner onShop={scrollToProducts} isLoading={isLoading} />
      </ViewportLoader>

      {/* INGREDIENT STORY */}
      <ViewportLoader fallback={<div className="h-80 bg-[#fefcf8]" />}>
        <IngredientStory isLoading={isLoading} />
      </ViewportLoader>

      {/* TESTIMONIALS */}
      <ViewportLoader fallback={<div className="h-64 bg-white" />}>
        <TestimonialsSection isLoading={isLoading} />
      </ViewportLoader>
    </div>
  );
}
