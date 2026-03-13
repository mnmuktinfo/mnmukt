import { COLORS } from "../../../style/theme";
import useTestimonials from "../../features/testimonials/hooks/useTestimonials";
import TestimonialCard from "../../../shared/components/TestimonialCard";

const TestimonialsSection = () => {
  const { testimonials, loading } = useTestimonials();

  // -----------------------------
  // Skeleton UI
  // -----------------------------
  if (loading) {
    return (
      <section className="w-full  bg-white">
        {/* Heading Skeleton */}
        <div className="text-center mb-16 animate-pulse">
          <div className="h-10 w-60 bg-gray-200 mx-auto rounded mb-4" />
          <div className="h-4 w-40 bg-gray-100 mx-auto rounded" />
        </div>

        {/* Cards Skeleton */}
        <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-lg shadow-sm border animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-full mb-4" />
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-100 rounded mb-2" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      </section>
    );
  }

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
          Mnmukt and Me
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

      {/* Cards */}
      <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
        {testimonials.map((t) => (
          <TestimonialCard
            key={t.id}
            name={t.name}
            img={t.img}
            message={t.message}
          />
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
