import TestimonialCard from "../../../shared/components/TestimonialCard";

const TestimonialsSection = ({ testimonials = [], loading = false }) => {
  /* ---------------- Skeleton ---------------- */
  if (loading) {
    return (
      <section className="w-full py-16 md:py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="text-center mb-12 animate-pulse">
            <div className="h-7 w-48 bg-gray-200 mx-auto rounded mb-3" />
            <div className="h-3 w-28 bg-gray-100 mx-auto rounded" />
          </div>

          {/* Cards Skeleton */}
          <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-full p-5 rounded-xl border bg-white animate-pulse">
                <div className="w-14 h-14 bg-gray-200 rounded-full mb-4" />
                <div className="h-3 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-100 rounded mb-2" />
                <div className="h-3 bg-gray-100 rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* ---------------- Empty State ---------------- */
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="w-full py-16 md:py-20 bg-white border-t border-gray-100">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── HEADER ── */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-[20px] md:text-[26px] font-medium text-gray-900">
            Mnmukt and Me
          </h2>

          <p className="mt-2 text-[11px] md:text-[12px] uppercase tracking-[0.25em] text-gray-500">
            Love Shared By You
          </p>
        </div>

        {/* ── GRID ── */}
        <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="h-full transition-transform duration-300 hover:-translate-y-1">
              <TestimonialCard name={t.name} img={t.img} message={t.message} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
