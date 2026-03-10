import React from "react";
import ProductCard from "../cards/ProductCard";
import { IMAGES } from "../../../assets/images";
import { COLORS } from "../../../style/theme";

const products = [
  {
    id: 1,
    title: "Sariona Denim Blue Co-ord Set",
    price: 12950,
    image:
      "https://shopmulmul.com/cdn/shop/files/88_115d8b10-f8dd-4d5d-a07a-5800f127bb85_800x.jpg?v=1755607569",
  },
  {
    id: 2,
    title: "Winslet Denim Shirt & Pant Set",
    price: 12950,
    image: [
      "https://shopmulmul.com/cdn/shop/files/7_1bf47440-7b9c-479f-8982-e6ef21700b5f_800x.jpg?v=1757594683",
      "https://shopmulmul.com/cdn/shop/files/7_1bf47440-7b9c-479f-8982-e6ef21700b5f_800x.jpg?v=1757594683",
    ],
    badge: "LIMITED EDITION",
  },
  {
    id: 3,
    title: "Ondra Denim Blue Kurta Set",
    price: 12950,
    image:
      "https://cdn.shopify.com/s/files/1/0088/4031/4931/files/188_20e089d1-7f04-4cb6-9042-7224655cd1f8.jpg?v=1756538942",
  },
  {
    id: 3,
    title: "Ondra Denim Blue Kurta Set",
    price: 12950,
    image:
      "https://cdn.shopify.com/s/files/1/0088/4031/4931/files/188_20e089d1-7f04-4cb6-9042-7224655cd1f8.jpg?v=1756538942",
  },
  {
    id: 3,
    title: "Ondra Denim Blue Kurta Set",
    price: 12950,
    image:
      "https://cdn.shopify.com/s/files/1/0088/4031/4931/files/188_20e089d1-7f04-4cb6-9042-7224655cd1f8.jpg?v=1756538942",
  },
  {
    id: 4,
    title: "Eirene Lawn Printed Navy Co-ord Set",
    price: 12950,
    image: IMAGES.product4,
    liked: true,
  },
];

const MostLovedStyles = () => {
  return (
    <section
      className="w-full px-6 md:px-12 py-12"
      style={{ background: COLORS.accentAlt }}>
      <h2
        className="text-center text-2xl md:text-3xl font-playfair font-semibold mb-12 tracking-wide"
        style={{ color: COLORS.textAlt }}>
        MOST LOVED STYLES
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {products.map((p) => (
          <ProductCard key={p.id} {...p} />
        ))}
      </div>
    </section>
  );
};

export default MostLovedStyles;
