import { Helmet } from "react-helmet-async";
import CollectionPage from "../features/p/CollectionPage";

export default function CoordSetsPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What are co-ord sets?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Co-ord sets are matching tops and bottoms designed to be worn together.",
        },
      },
      {
        "@type": "Question",
        name: "Are your co-ord sets made from cotton?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. We offer premium cotton, linen and breathable fabric co-ord sets.",
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
        name: "Co-ord Sets",
        item: "https://mnmukt.com/collections/co-ord-sets",
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>
          Women's Co-ord Sets | Cotton & Premium Matching Sets | Mnmukt
        </title>

        <meta
          name="description"
          content="Shop premium women's co-ord sets online at Mnmukt. Discover cotton co-ord sets, festive styles, casual outfits and matching sets."
        />

        <meta
          name="keywords"
          content="women co-ord sets,cotton co-ord sets,premium co-ord sets"
        />

        <link
          rel="canonical"
          href="https://mnmukt.com/collections/co-ord-sets"
        />

        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>

        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-4xl font-bold">Women's Premium Co-ord Sets</h1>

        <p className="mt-4 max-w-3xl text-gray-600">
          Explore premium cotton co-ord sets, matching outfits, festive wear,
          office wear and casual styles designed for modern women.
        </p>
      </section>

      <CollectionPage collectionType="co-ord-sets" />

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-3xl font-semibold">
          Why Choose Mnmukt Co-ord Sets?
        </h2>

        <p className="mt-5 text-gray-600">
          Our co-ord sets combine premium fabrics, elegant designs and lasting
          comfort, making them perfect for daily wear, travel, office and
          festive occasions.
        </p>
      </section>
    </>
  );
}
