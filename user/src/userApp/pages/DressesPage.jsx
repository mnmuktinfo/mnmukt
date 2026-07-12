import { Helmet } from "react-helmet-async";
import CollectionPage from "../features/p/CollectionPage";

export default function DressesPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What types of dresses are available?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our collection includes casual dresses, festive dresses, cotton dresses, ethnic dresses, and elegant styles for every occasion.",
        },
      },
      {
        "@type": "Question",
        name: "Are your dresses made from breathable fabrics?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. We use premium quality cotton, rayon, linen and other comfortable fabrics.",
        },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://mnmukt.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Collections",
        item: "https://mnmukt.com/collections",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Dresses",
        item: "https://mnmukt.com/collections/dresses",
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>
          Women's Dresses | Cotton, Casual & Party Wear Dresses | Mnmukt
        </title>

        <meta
          name="description"
          content="Shop premium women's dresses online at Mnmukt. Explore cotton dresses, casual dresses, festive wear, ethnic dresses and the latest designer collections."
        />

        <meta
          name="keywords"
          content="women dresses, cotton dresses, casual dresses, party wear dresses, ethnic dresses, designer dresses"
        />

        <link rel="canonical" href="https://mnmukt.com/collections/dresses" />

        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>

        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* SEO Intro */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-4xl font-bold">Women's Premium Dresses</h1>

        <p className="mt-4 max-w-3xl text-lg text-gray-600">
          Discover premium dresses for women at Mnmukt. Browse cotton dresses,
          casual styles, festive wear, party dresses and elegant outfits
          designed for comfort, quality and timeless fashion.
        </p>
      </section>

      {/* Products */}
      <CollectionPage collectionType="dresses" />

      {/* Bottom SEO Content */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-3xl font-semibold">
          Shop Premium Women's Dresses Online
        </h2>

        <p className="mt-5 leading-8 text-gray-600">
          Whether you're looking for everyday comfort, festive elegance or a
          statement outfit for a special occasion, Mnmukt offers thoughtfully
          designed dresses crafted from premium fabrics. Every piece combines
          style, comfort and lasting quality.
        </p>
      </section>
    </>
  );
}
