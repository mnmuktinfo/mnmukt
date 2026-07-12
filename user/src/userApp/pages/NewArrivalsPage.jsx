import { Helmet } from "react-helmet-async";
import CollectionPage from "../features/p/CollectionPage";

export default function NewArrivalsPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What are New Arrivals?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "New Arrivals feature the latest fashion collections, recently launched styles, and trending outfits at Mnmukt.",
        },
      },
      {
        "@type": "Question",
        name: "How often are New Arrivals updated?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our New Arrivals collection is updated regularly with the latest designs and seasonal fashion trends.",
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
        name: "New Arrivals",
        item: "https://mnmukt.com/collections/new-arrivals",
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>New Arrivals | Latest Women's Fashion Collection | Mnmukt</title>

        <meta
          name="description"
          content="Discover the latest women's fashion at Mnmukt. Shop new arrivals including dresses, co-ord sets, ethnic wear, tops and premium outfits."
        />

        <meta
          name="keywords"
          content="new arrivals, latest women's fashion, new collection, trending outfits, dresses, co-ord sets, ethnic wear"
        />

        <link
          rel="canonical"
          href="https://mnmukt.com/collections/new-arrivals"
        />

        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>

        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* SEO Intro */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-4xl font-bold">New Arrivals</h1>

        <p className="mt-4 max-w-3xl text-lg text-gray-600">
          Explore the newest fashion arrivals at Mnmukt. Discover freshly
          launched dresses, co-ord sets, ethnic wear, tops and premium outfits
          designed with modern trends, superior craftsmanship and all-day
          comfort.
        </p>
      </section>

      {/* Products */}
      <CollectionPage collectionType="new-arrivals" />

      {/* Bottom SEO Content */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-3xl font-semibold">
          Shop the Latest Fashion Trends
        </h2>

        <p className="mt-5 leading-8 text-gray-600">
          Stay ahead of every season with our latest collections. Every new
          arrival is carefully selected to bring together timeless elegance,
          premium fabrics and contemporary fashion, making it easy to refresh
          your wardrobe with the newest styles.
        </p>
      </section>
    </>
  );
}
