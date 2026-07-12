import React from "react";
import { Helmet } from "react-helmet-async";

export default function OurStory() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://mnmukt.com/#organization",
        name: "Mnmukt",
        legalName: "Mnmukt",
        url: "https://mnmukt.com/",
        logo: {
          "@type": "ImageObject",
          "@id": "https://mnmukt.com/#logo",
          url: "https://mnmukt.com/appLogo.png",
          contentUrl: "https://mnmukt.com/appLogo.png",
          caption: "Mnmukt Logo",
        },
        image: { "@id": "https://mnmukt.com/#logo" },
        description:
          "Mnmukt is an Indian fashion brand creating premium ethnic wear and handcrafted cotton clothing for women, rooted in natural fabrics and sustainable, conscious design.",
        sameAs: [
          "https://www.instagram.com/mnmukt",
          "https://www.facebook.com/mnmukt",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://mnmukt.com/#website",
        url: "https://mnmukt.com/",
        name: "Mnmukt",
        publisher: { "@id": "https://mnmukt.com/#organization" },
        inLanguage: "en-IN",
      },
      {
        "@type": "WebPage",
        "@id": "https://mnmukt.com/about-us/#webpage",
        url: "https://mnmukt.com/about-us",
        name: "Our Story | Mnmukt - Premium Ethnic Wear",
        isPartOf: { "@id": "https://mnmukt.com/#website" },
        about: { "@id": "https://mnmukt.com/#organization" },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        },
        breadcrumb: { "@id": "https://mnmukt.com/about-us/#breadcrumb" },
        description:
          "Discover the story behind Mnmukt. Born from a love for natural fabrics, thoughtful design, and everyday comfort in premium ethnic wear.",
        inLanguage: "en-IN",
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://mnmukt.com/about-us/#breadcrumb",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://mnmukt.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Our Story",
            item: "https://mnmukt.com/about-us",
          },
        ],
      },
    ],
  };

  return (
    <div className="bg-white min-h-screen font-sans text-gray-900">
      <Helmet>
        <html lang="en-IN" />
        <title>Our Story | Mnmukt – Premium Ethnic Wear Brand</title>

        <meta
          name="description"
          content="Discover Mnmukt's story — an Indian fashion brand crafting premium ethnic wear and handcrafted cotton clothing for women who value comfort, sustainability, and timeless style."
        />

        <meta
          name="keywords"
          content="Premium Ethnic Wear, Women's Fashion, Cotton Clothing, Handcrafted Clothing, Sustainable Fashion, Indian Fashion Brand, Contemporary Ethnic Wear, About Mnmukt, Our Story"
        />

        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta httpEquiv="content-language" content="en-IN" />
        <meta name="author" content="Mnmukt" />

        <link rel="canonical" href="https://mnmukt.com/about-us" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Our Story | Mnmukt – Premium Ethnic Wear Brand"
        />
        <meta
          property="og:description"
          content="Discover Mnmukt's story — an Indian fashion brand crafting premium ethnic wear and handcrafted cotton clothing for women who value comfort, sustainability, and timeless style."
        />
        <meta property="og:url" content="https://mnmukt.com/about-us" />
        <meta property="og:site_name" content="Mnmukt" />
        <meta property="og:locale" content="en_IN" />
        <meta
          property="og:image"
          content="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="Founders of Mnmukt, an Indian premium ethnic wear brand"
        />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Our Story | Mnmukt – Premium Ethnic Wear Brand"
        />
        <meta
          name="twitter:description"
          content="Discover Mnmukt's story — crafting premium ethnic wear and handcrafted cotton clothing for women who value comfort, sustainability, and timeless style."
        />
        <meta
          name="twitter:image"
          content="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
        />

        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <main>
        {/* Breadcrumb Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          <nav aria-label="Breadcrumb" className="flex">
            <ol
              role="list"
              className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
              <li>
                <a href="/" className="hover:text-gray-900 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <span className="mx-1 sm:mx-2" aria-hidden="true">
                  /
                </span>
              </li>
              <li>
                <span className="text-gray-900 font-medium" aria-current="page">
                  Our Story
                </span>
              </li>
            </ol>
          </nav>
        </div>

        {/* Page Title */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900">
            Our Story
          </h1>
          <p className="mt-4 text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            The journey of Mnmukt, a premium ethnic wear brand built on natural
            fabrics, handcrafted detail, and everyday comfort.
          </p>
        </div>

        {/* Main Content Sections */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24 space-y-16 md:space-y-24">
          {/* Section 1: About Mnmukt */}
          <section
            aria-labelledby="about-mnmukt-heading"
            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            <div className="flex justify-center md:justify-start order-1">
              <img
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Founders of Mnmukt, a premium ethnic wear brand from India"
                className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 object-cover rounded-full shadow-2xl hover:scale-105 transition-transform duration-500"
                loading="lazy"
                width="384"
                height="384"
              />
            </div>
            <article className="text-center md:text-left order-2">
              <h2
                id="about-mnmukt-heading"
                className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
                About Mnmukt
              </h2>
              <div className="space-y-4 text-base md:text-lg text-gray-600 leading-relaxed">
                <p>
                  At Mnmukt, fashion is more than what you wear — it's how you
                  feel in it. Born from a love for natural fabrics, thoughtful
                  design, and everyday comfort, Mnmukt creates{" "}
                  <strong>premium ethnic wear</strong> that feels effortless,
                  breathable, and beautifully wearable for real life. As a
                  contemporary Indian fashion brand, we believe that women's
                  fashion should never ask you to trade comfort for style.
                </p>
                <p>
                  We design for women who appreciate chic simplicity, soulful
                  style, and curated comfort — pieces that move with you from
                  slow mornings to busy days, from casual gatherings to quiet
                  celebrations. Every piece of{" "}
                  <a
                    href="/collections/all"
                    className="underline decoration-gray-300 underline-offset-2 hover:text-gray-900 hover:decoration-gray-900 transition-colors">
                    our collection
                  </a>{" "}
                  is designed to be an extension of your everyday life, not a
                  costume reserved for special occasions.
                </p>
                <p>
                  Our love for natural cotton clothing and handcrafted finishing
                  sets us apart in a market crowded with mass-produced fast
                  fashion. We work closely with skilled artisans and weavers to
                  bring you contemporary ethnic wear that honours tradition
                  while feeling modern, minimal, and effortlessly chic.
                </p>
              </div>
            </article>
          </section>

          {/* Section 2: Our Journey */}
          <section
            aria-labelledby="our-journey-heading"
            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            <article className="text-center md:text-left order-2 md:order-1">
              <h2
                id="our-journey-heading"
                className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
                Our Journey
              </h2>
              <div className="space-y-4 text-base md:text-lg text-gray-600 leading-relaxed">
                <p>
                  Mnmukt was created with a simple idea: to make clothing that
                  feels gentle on the skin, kind to the planet, and timeless in
                  style. What began as a small idea has grown into a brand
                  trusted by women across India who are looking for sustainable
                  fashion that doesn't compromise on elegance.
                </p>
                <p>
                  In a world of fast fashion and fleeting trends, we choose a
                  slower, more meaningful path. Our collections are rooted in
                  handcrafted techniques, breathable cotton fabrics, and
                  conscious production, celebrating the beauty of imperfections
                  and human touch. Every garment tells a story of craft, care,
                  and creativity.
                </p>
                <p>
                  From our first capsule collection to the wide range of{" "}
                  <a
                    href="/new-arrivals"
                    className="underline decoration-gray-300 underline-offset-2 hover:text-gray-900 hover:decoration-gray-900 transition-colors">
                    new arrivals
                  </a>{" "}
                  we release today, our journey has always been guided by one
                  question: how can we make women feel more comfortable and
                  confident in what they wear? That question shapes every fabric
                  choice, every stitch, and every silhouette we design.
                </p>
                <p>
                  As our community has grown, so has our range — from relaxed,
                  breathable{" "}
                  <a
                    href="/dresses"
                    className="underline decoration-gray-300 underline-offset-2 hover:text-gray-900 hover:decoration-gray-900 transition-colors">
                    dresses
                  </a>{" "}
                  for everyday wear to versatile{" "}
                  <a
                    href="/co-ord-sets"
                    className="underline decoration-gray-300 underline-offset-2 hover:text-gray-900 hover:decoration-gray-900 transition-colors">
                    co-ord sets
                  </a>{" "}
                  that move effortlessly from home to travel to gatherings with
                  friends. Each collection carries forward the same values we
                  started with: natural fabrics, honest craftsmanship, and
                  quiet, wearable elegance.
                </p>
              </div>
            </article>
            <div className="flex justify-center md:justify-end order-1 md:order-2">
              <img
                src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Mnmukt artisans hand-weaving cotton fabric for ethnic wear"
                className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 object-cover rounded-full shadow-2xl hover:scale-105 transition-transform duration-500"
                loading="lazy"
                width="384"
                height="384"
              />
            </div>
          </section>

          {/* Section 3: What We Believe In */}
          <section
            aria-labelledby="what-we-believe-heading"
            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            <div className="flex justify-center md:justify-start order-1">
              <img
                src="https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Handcrafted embroidery detail on Mnmukt ethnic wear"
                className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 object-cover rounded-full shadow-2xl hover:scale-105 transition-transform duration-500"
                loading="lazy"
                width="384"
                height="384"
              />
            </div>
            <article className="text-center md:text-left order-2">
              <h2
                id="what-we-believe-heading"
                className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
                What We Believe In
              </h2>
              <div className="space-y-6 md:space-y-8">
                <div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">
                    Handcrafted Excellence
                  </h3>
                  <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                    Our designs honour traditional craftsmanship, handcrafted
                    details, and artisanal finishing that bring authenticity to
                    every piece of handcrafted clothing we create.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">
                    Everyday Elegance
                  </h3>
                  <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                    Creating versatile, enduring pieces for your everyday
                    wardrobe, ensuring you never have to choose between looking
                    beautiful and feeling completely comfortable.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">
                    Sustainable, Conscious Fashion
                  </h3>
                  <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                    We use natural, breathable cotton fabrics and mindful
                    production practices, so our sustainable fashion choices are
                    kind to both the people who make them and the planet that
                    sustains us.
                  </p>
                </div>
              </div>
            </article>
          </section>

          {/* Section 4: Explore Mnmukt */}
          <section
            aria-labelledby="explore-mnmukt-heading"
            className="text-center max-w-3xl mx-auto">
            <h2
              id="explore-mnmukt-heading"
              className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
              Explore Mnmukt
            </h2>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-6">
              We invite you to explore the world of Mnmukt further. Browse our
              full{" "}
              <a
                href="/collections/all"
                className="underline decoration-gray-300 underline-offset-2 hover:text-gray-900 hover:decoration-gray-900 transition-colors">
                collections
              </a>
              , discover our latest{" "}
              <a
                href="/new-arrivals"
                className="underline decoration-gray-300 underline-offset-2 hover:text-gray-900 hover:decoration-gray-900 transition-colors">
                new arrivals
              </a>
              , shop breathable{" "}
              <a
                href="/dresses"
                className="underline decoration-gray-300 underline-offset-2 hover:text-gray-900 hover:decoration-gray-900 transition-colors">
                dresses
              </a>{" "}
              and versatile{" "}
              <a
                href="/co-ord-sets"
                className="underline decoration-gray-300 underline-offset-2 hover:text-gray-900 hover:decoration-gray-900 transition-colors">
                co-ord sets
              </a>
              , or simply{" "}
              <a
                href="/contact-us"
                className="underline decoration-gray-300 underline-offset-2 hover:text-gray-900 hover:decoration-gray-900 transition-colors">
                get in touch with us
              </a>{" "}
              — we would love to hear from you and help you find the perfect
              piece of premium ethnic wear for your wardrobe.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
