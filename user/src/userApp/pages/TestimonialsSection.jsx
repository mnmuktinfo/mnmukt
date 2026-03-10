import React from "react";
import { COLORS } from "../../style/theme";

const testimonials = [
  {
    name: "Sumati",
    img: "https://shopmulmul.com/cdn/shop/files/WEBSITE_MULMUL_AND_ME_f2245975-b957-485f-be11-f5bc81a5a6d1.png?v=1760098649&width=500",
    message: "Thanks Mulmul for the beautiful outfit, just loved the outfit 🤍",
  },
  {
    name: "Sherryl Goyal",
    img: "https://shopmulmul.com/cdn/shop/files/WEBSITE_MULMUL_AND_ME_f2245975-b957-485f-be11-f5bc81a5a6d1.png?v=1760098649&width=500",
    message: "Thankyou for the lovely outfit ✨",
  },
  {
    name: "Isha Sudan",
    img: "https://shopmulmul.com/cdn/shop/files/WEBSITE_MULMUL_AND_ME_f2245975-b957-485f-be11-f5bc81a5a6d1.png?v=1760098649&width=500",
    message: "Loved it totally !!!",
  },
  {
    name: "Nancy Bhatia & Akanksha Arora",
    img: "https://shopmulmul.com/cdn/shop/files/WEBSITE_MULMUL_AND_ME_f2245975-b957-485f-be11-f5bc81a5a6d1.png?v=1760098649&width=500",
    message:
      "I always turn to Mulmul for both festive and everyday wear—consistently beautiful and comfortable. My friends and family love it too!",
  },
  {
    name: "Sanchi Jain",
    img: "https://shopmulmul.com/cdn/shop/files/WEBSITE_MULMUL_AND_ME_f2245975-b957-485f-be11-f5bc81a5a6d1.png?v=1760098649&width=500",
    message:
      "The quality is amazing—pure fabric, breathable, and so easy to style. Worth every penny.",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="w-full py-20 px-4 md:px-10 bg-white">
      {/* Heading */}
      <div className="text-center mb-16">
        <h2
          className="text-4xl md:text-5xl font-semibold"
          style={{
            color: COLORS.textAlt,
            fontFamily: "Playfair Display, serif",
          }}>
          Mulmul and Me
        </h2>

        <p
          className="mt-2 tracking-widest text-sm"
          style={{
            letterSpacing: "3px",
            color: COLORS.textAlt,
            fontFamily: "Montserrat, sans-serif",
          }}>
          LOVE SHARED BY YOU
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
        {testimonials.slice(0, 3).map((t, idx) => (
          <div
            key={idx}
            className="relative pt-20 pb-12 px-10 rounded-xl text-center shadow-sm"
            style={{
              background: "#F9F3EC",
            }}>
            {/* Floating Circular Image */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2">
              <img
                src={t.img}
                alt={t.name}
                className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white"
              />
            </div>

            {/* Name */}
            <h3
              className="mt-10 text-xl font-semibold"
              style={{
                color: COLORS.primaryAlt,
                fontFamily: "Playfair Display, serif",
              }}>
              {t.name}
            </h3>

            {/* Message */}
            <p
              className="mt-4 text-sm leading-relaxed"
              style={{
                color: COLORS.textAlt,
                fontFamily: "Inter, sans-serif",
              }}>
              {t.message}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
