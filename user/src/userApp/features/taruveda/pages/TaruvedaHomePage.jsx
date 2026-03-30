import React, { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

/* ── Heroicons (outline) ── */
import {
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  SparklesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
  ArrowRightIcon,
  GiftIcon,
  BeakerIcon,
  SunIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";

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
  { icon: TruckIcon, label: "Free Delivery", sub: "On orders above ₹999" },
  {
    icon: ShieldCheckIcon,
    label: "100% Authentic",
    sub: "USDA & India Organic certified",
  },
  {
    icon: ArrowPathIcon,
    label: "Easy Returns",
    sub: "7-day hassle-free returns",
  },
  {
    icon: SparklesIcon,
    label: "Zero Chemicals",
    sub: "No parabens, sulfates or SLS",
  },
];

const INGREDIENTS = [
  { name: "Brahmi", benefit: "Strengthens roots", icon: BeakerIcon },
  { name: "Amla", benefit: "Prevents hairfall", icon: SunIcon },
  { name: "Neem", benefit: "Soothes scalp", icon: SparklesIcon },
  { name: "Bhringraj", benefit: "Boosts growth", icon: FireIcon },
];

const CATEGORY_PILLS = [
  { label: "Hair Care", icon: BeakerIcon, sub: "Oils, Shampoos & Masks" },
  { label: "Skin Care", icon: SparklesIcon, sub: "Serums & Moisturisers" },
  { label: "Body Care", icon: SunIcon, sub: "Scrubs & Body Oils" },
  { label: "Combos", icon: GiftIcon, sub: "Value Gift Bundles" },
];

const MARQUEE_TAGS = [
  "100% Organic",
  "Ayurvedic Formula",
  "Zero Chemicals",
  "Cold-Pressed Oils",
  "Cruelty Free",
];

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
    subtitle: "Nature Powered Rituals",
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
   HOOKS
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

/* ════════════════════════════════════════════
   REUSABLE PRIMITIVES
════════════════════════════════════════════ */

/** Lazy-mount children when they scroll into view */
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

/** Section header — centered, matches TaruVeda editorial style */
const SectionHeader = ({ eyebrow, title }) => (
  <div className="text-center mb-10 md:mb-14">
    {eyebrow && (
      <span className="block text-[10px] font-black uppercase tracking-[0.28em] text-[#7aad5a] mb-2">
        {eyebrow}
      </span>
    )}
    <h2
      className="text-2xl md:text-3xl font-light text-[#0f2318]"
      style={{ fontFamily: "'Playfair Display', serif" }}>
      {title}
    </h2>
  </div>
);

/** Pill / badge used across cards */
const Pill = ({ children, className = "" }) => (
  <span
    className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${className}`}>
    {children}
  </span>
);

/** Icon tile used in BenefitsBar and IngredientStory */
const IconTile = ({
  icon: Icon,
  label,
  sub,
  hoverBg = "group-hover:bg-[#3a7c23]",
}) => (
  <div className="flex items-center gap-4 group">
    <div
      className={`w-10 h-10 bg-[#f7faf5] rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${hoverBg}`}>
      <Icon className="w-5 h-5 text-[#3a7c23] group-hover:text-white transition-colors" />
    </div>
    <div>
      <div className="text-xs font-black text-[#0f2318] uppercase tracking-wide">
        {label}
      </div>
      {sub && <div className="text-[10px] text-[#9e9080] mt-0.5">{sub}</div>}
    </div>
  </div>
);

/** Carousel nav buttons (prev / next) */
const CarouselNav = ({ onPrev, onNext, prevDisabled, nextDisabled }) => (
  <div className="flex gap-2.5">
    {[
      { Icon: ChevronLeftIcon, action: onPrev, disabled: prevDisabled },
      { Icon: ChevronRightIcon, action: onNext, disabled: nextDisabled },
    ].map(({ Icon, action, disabled }, i) => (
      <button
        key={i}
        onClick={action}
        disabled={disabled}
        className="w-11 h-11 rounded-full bg-[#f7faf5] border border-[#ede9e0] flex items-center justify-center text-[#9e9080]
          hover:border-[#0f2318] hover:text-[#0f2318] transition-all disabled:opacity-30 focus:outline-none">
        <Icon className="w-5 h-5" />
      </button>
    ))}
  </div>
);

/** Star row (outline + solid mix) */
const StarRow = ({ rating, max = 5 }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: max }).map((_, i) =>
      i < rating ? (
        <StarSolid key={i} className="w-4 h-4 text-[#d4ac3a]" />
      ) : (
        <StarIcon key={i} className="w-4 h-4 text-[#ede9e0]" />
      ),
    )}
  </div>
);

/* ════════════════════════════════════════════
   SKELETON HELPERS
════════════════════════════════════════════ */
const pulse = "animate-pulse bg-gray-100 rounded";

const SkeletonRow = ({ count, className }) => (
  <div className={className}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`${pulse} h-full`} />
    ))}
  </div>
);

/* ════════════════════════════════════════════
   PAGE SECTIONS
════════════════════════════════════════════ */

/* ── Marquee Strip ── */
const MarqueeStrip = ({ isLoading }) =>
  isLoading ? (
    <div className="h-10 bg-[#0f2318] animate-pulse border-b border-[#2C3E30]" />
  ) : (
    <div className="bg-[#0f2318] py-2.5 overflow-hidden border-b border-[#2C3E30]">
      <style>{`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-33.33%)}}`}</style>
      <div className="flex gap-8 animate-[marquee_25s_linear_infinite] whitespace-nowrap w-max">
        {[...MARQUEE_TAGS, ...MARQUEE_TAGS, ...MARQUEE_TAGS].map((item, i) => (
          <div key={i} className="flex items-center gap-8">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f7faf5]/90">
              {item}
            </span>
            <SparklesIcon className="w-3 h-3 text-[#7aad5a]" />
          </div>
        ))}
      </div>
    </div>
  );

/* ── Benefits Bar ── */
const BenefitsBar = ({ isLoading }) => (
  <section className="py-8 bg-white border-b border-[#ede9e0]">
    <div className="max-w-[1440px] mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-6">
      {isLoading
        ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 items-center animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-100 w-2/3 rounded" />
                <div className="h-2 bg-gray-50 w-1/2 rounded" />
              </div>
            </div>
          ))
        : BENEFITS.map((b) => <IconTile key={b.label} {...b} />)}
    </div>
  </section>
);

/* ── Ingredient Story ── */
const IngredientStory = ({ isLoading }) => (
  <section className="py-20 md:py-24 bg-[#fefcf8] border-y border-[#ede9e0]">
    <div className="max-w-[1440px] mx-auto px-5 md:px-10">
      {isLoading ? (
        <>
          <div className={`${pulse} w-1/3 h-10 mb-10`} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array(4)
              .fill(null)
              .map((_, i) => (
                <div key={i} className={`${pulse} h-32`} />
              ))}
          </div>
        </>
      ) : (
        <>
          <SectionHeader
            eyebrow="The TaruVeda Difference"
            title="Sourced From Nature's Purest Corners"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {INGREDIENTS.map(({ name, benefit, icon: Icon }) => (
              <div
                key={name}
                className="bg-white border border-[#ede9e0] rounded-2xl p-6 text-center
                  hover:border-[#3a7c23]/30 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 mx-auto bg-[#f7faf5] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5 text-[#3a7c23]" />
                </div>
                <h3 className="text-sm font-bold text-[#0f2318] mb-1">
                  {name}
                </h3>
                <p className="text-[11px] text-[#9e9080] leading-relaxed">
                  {benefit}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  </section>
);

/* ── Promo Banner ── */
const PromoBanner = ({ onShop, isLoading }) => (
  <section className="py-12 md:py-16 bg-white">
    <div className="max-w-[1440px] mx-auto px-5">
      {isLoading ? (
        <div className={`${pulse} w-full h-48 sm:h-64 rounded-2xl`} />
      ) : (
        <div className="bg-[#0f2318] rounded-2xl p-8 md:p-14 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle,#ffffff 1px,transparent 1px)",
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
              className="inline-flex items-center gap-2 bg-[#3a7c23] text-white px-8 py-3.5 rounded-full
                text-xs font-black uppercase tracking-widest hover:bg-[#2d621b] transition-colors shadow-lg">
              Explore Collection
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  </section>
);

/* ── Testimonials ── */
const TestimonialsSection = ({ isLoading }) => {
  const [idx, setIdx] = useState(0);
  const isMob = useIsMobile();
  const shown = isMob ? 1 : 2;
  const max = TESTIMONIALS.length - shown;

  return (
    <section className="py-20 md:py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-5 md:px-10">
        {isLoading ? (
          <>
            <div className={`${pulse} w-1/4 h-8 mb-10`} />
            <div className="grid md:grid-cols-2 gap-5">
              {Array(shown)
                .fill(null)
                .map((_, i) => (
                  <div key={i} className={`${pulse} h-48 rounded-2xl`} />
                ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <SectionHeader
                eyebrow="Customer Stories"
                title="Real Results, Real People"
              />
              <CarouselNav
                onPrev={() => setIdx((v) => Math.max(0, v - 1))}
                onNext={() => setIdx((v) => Math.min(max, v + 1))}
                prevDisabled={idx === 0}
                nextDisabled={idx >= max}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {TESTIMONIALS.slice(idx, idx + shown).map((t, i) => (
                <div
                  key={`${idx}-${i}`}
                  className="bg-[#fefcf8] border border-[#ede9e0] rounded-2xl p-7 md:p-8">
                  <StarRow rating={t.rating} />
                  <p className="mt-5 text-[#4a4035] text-sm md:text-base leading-[1.8] mb-6 italic font-light">
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
                    <Pill className="text-[#3a7c23] bg-[#f7faf5] border-[#ede9e0]">
                      {t.product}
                    </Pill>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

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
  const products = liveProducts?.length ? liveProducts : STATIC_PRODUCTS;

  const productSections = useMemo(
    () =>
      PRODUCT_SECTIONS.map((section) => {
        let items = products.filter(section.filter);
        if (section.fallback && items.length === 0) items = products;
        return {
          ...section,
          products: isMobile ? items.slice(0, 4) : items.slice(0, 8),
        };
      }),
    [products, isMobile],
  );

  const scrollToProducts = () =>
    document
      .getElementById("tv-products")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="min-h-screen bg-[#fefcf8] text-[#0f2318] overflow-x-hidden selection:bg-[#3a7c23] selection:text-white">
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

      {/* MARQUEE */}
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
