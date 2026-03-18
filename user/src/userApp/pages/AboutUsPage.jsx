import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Sparkles, Heart } from "lucide-react";

const AboutUsPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#da127d] selection:text-white">
      {/* ── 1. HERO SECTION ── */}
      <section className="pt-24 pb-16 px-6 text-center max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <span className="text-[#da127d] text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.4em] mb-6 block">
          Our Story
        </span>
        <h1
          className="text-4xl md:text-6xl lg:text-7xl text-gray-900 font-light leading-tight mb-8"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          A Symphony of <br />
          <span className="italic text-gray-500">Tradition & Elegance</span>
        </h1>
        <p className="text-[15px] md:text-[16px] text-gray-500 font-light leading-relaxed max-w-2xl mx-auto">
          Mnmukt was born from a desire to revive the timeless poetry of Indian
          textiles. We craft breathable, luxurious silhouettes that celebrate
          the modern woman while staying deeply rooted in our heritage.
        </p>
      </section>

      {/* ── 2. HERO IMAGE (FULL WIDTH) ── */}
      <section className="w-full px-4 sm:px-6 md:px-12 pb-24">
        <div className="w-full h-[60vh] md:h-[80vh] overflow-hidden rounded-sm">
          <img
            src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=2000&auto=format&fit=crop"
            alt="Mnmukt Craftsmanship"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-[2s] ease-out"
          />
        </div>
      </section>

      {/* ── 3. THE PHILOSOPHY (SPLIT LAYOUT) ── */}
      <section className="py-24 bg-[#FAFAFA]">
        <div className="max-w-[1300px] mx-auto px-6 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1 space-y-8 order-2 lg:order-1">
            <span className="text-gray-400 text-[11px] font-bold uppercase tracking-widest flex items-center gap-3">
              <div className="w-8 h-[1px] bg-[#da127d]"></div> The Philosophy
            </span>
            <h2
              className="text-3xl md:text-5xl text-gray-900 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Redefining <span className="italic">Luxury</span> <br /> Everyday.
            </h2>
            <p className="text-[15px] text-gray-600 font-light leading-relaxed">
              We believe that true luxury lies in comfort. Inspired by the
              softness of pure mulmul and the intricate artistry of hand-block
              prints, our collections are designed to feel like a second skin.
              Every thread we weave is a testament to slow fashion, ensuring
              that what you wear is as kind to the earth as it is to you.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-6">
              <div>
                <Leaf
                  size={24}
                  strokeWidth={1}
                  className="text-[#da127d] mb-4"
                />
                <h4 className="text-[12px] font-bold uppercase tracking-widest text-gray-900 mb-2">
                  Pure Fabrics
                </h4>
                <p className="text-[13px] text-gray-500 font-light">
                  Sourced ethically, crafted beautifully.
                </p>
              </div>
              <div>
                <Sparkles
                  size={24}
                  strokeWidth={1}
                  className="text-[#da127d] mb-4"
                />
                <h4 className="text-[12px] font-bold uppercase tracking-widest text-gray-900 mb-2">
                  Artisan Made
                </h4>
                <p className="text-[13px] text-gray-500 font-light">
                  Supporting local craftsmen across India.
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full order-1 lg:order-2 relative">
            {/* Main Image */}
            <img
              src="https://images.unsplash.com/photo-1583391733958-d25e07fac04f?q=80&w=1000&auto=format&fit=crop"
              alt="Indian Ethnic Wear"
              className="w-full h-[500px] md:h-[700px] object-cover rounded-sm shadow-xl"
            />
            {/* Overlapping smaller image for editorial look */}
            <img
              src="https://images.unsplash.com/photo-1605763240000-7e93b172d754?q=80&w=600&auto=format&fit=crop"
              alt="Fabric Detail"
              className="hidden md:block absolute -bottom-12 -left-12 w-64 h-80 object-cover border-8 border-[#FAFAFA] shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* ── 4. THE CRAFT (SPLIT LAYOUT - REVERSED) ── */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1300px] mx-auto px-6 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1 w-full relative">
            <img
              src="https://images.unsplash.com/photo-1604085572504-a392ddf0d86a?q=80&w=1000&auto=format&fit=crop"
              alt="Embroidery Detail"
              className="w-full h-[500px] md:h-[650px] object-cover rounded-sm"
            />
          </div>
          <div className="flex-1 space-y-8">
            <span className="text-gray-400 text-[11px] font-bold uppercase tracking-widest flex items-center gap-3">
              <div className="w-8 h-[1px] bg-[#da127d]"></div> The Craftsmanship
            </span>
            <h2
              className="text-3xl md:text-5xl text-gray-900 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Woven with <span className="italic">Love.</span>
            </h2>
            <p className="text-[15px] text-gray-600 font-light leading-relaxed">
              Behind every Mnmukt garment is an artisan whose hands have spent
              decades mastering their craft. From the delicate threadwork of
              intricate embroidery to the precision of hand-cut silhouettes, our
              process is unhurried and deliberate.
            </p>
            <p className="text-[15px] text-gray-600 font-light leading-relaxed">
              We don't just create clothes; we create heirlooms. Pieces designed
              to be loved, lived in, and passed down through generations.
            </p>
            <div className="pt-6">
              <Link
                to="/collections"
                className="inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-gray-900 hover:text-[#da127d] transition-colors pb-1 border-b border-gray-900 hover:border-[#da127d]">
                Explore The Collection <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. QUOTE / BRAND MANIFESTO ── */}
      <section className="py-24 bg-[#1a1a1a] text-center px-6">
        <div className="max-w-4xl mx-auto">
          <Heart
            size={32}
            strokeWidth={1}
            className="text-[#da127d] mx-auto mb-8"
          />
          <h3
            className="text-3xl md:text-5xl text-white font-light leading-relaxed tracking-wide"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            "To wear <span className="italic text-[#da127d]">Mnmukt</span> is to
            embrace the art of being effortlessly beautiful, unapologetically
            yourself, and forever rooted in grace."
          </h3>
        </div>
      </section>

      {/* ── 6. INSTAGRAM / IMAGE GRID ── */}
      <section className="py-24 max-w-[1500px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <span className="text-[#da127d] text-[10px] font-bold uppercase tracking-widest mb-4 block">
            Join The Journey
          </span>
          <h2
            className="text-3xl md:text-4xl text-gray-900"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            #WomenOfMnmukt
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <img
            src="https://images.unsplash.com/photo-1610030469614-7476e828469e?q=80&w=600&auto=format&fit=crop"
            alt="Gallery 1"
            className="w-full h-[300px] md:h-[400px] object-cover hover:opacity-90 transition-opacity cursor-pointer"
          />
          <img
            src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop"
            alt="Gallery 2"
            className="w-full h-[300px] md:h-[400px] object-cover hover:opacity-90 transition-opacity cursor-pointer md:mt-12"
          />
          <img
            src="https://images.unsplash.com/photo-1583391733975-408931165cb4?q=80&w=600&auto=format&fit=crop"
            alt="Gallery 3"
            className="w-full h-[300px] md:h-[400px] object-cover hover:opacity-90 transition-opacity cursor-pointer"
          />
          <img
            src="https://images.unsplash.com/photo-1622396089766-3d2b2a1a8b13?q=80&w=600&auto=format&fit=crop"
            alt="Gallery 4"
            className="w-full h-[300px] md:h-[400px] object-cover hover:opacity-90 transition-opacity cursor-pointer md:mt-12"
          />
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;
