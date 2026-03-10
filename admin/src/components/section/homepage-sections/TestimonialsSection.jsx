import React, { useEffect, useState } from "react";
import { useTestimonials } from "../../../hooks/useTestimonials";
import TestimonialCard from "../../../../shared/components/TestimonialCard";

const TestimonialsSection = () => {
  const { activeTestimonials, loadActiveTestimonials } = useTestimonials();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await loadActiveTestimonials();
      setLoading(false);
    };
    loadData();
  }, [loadActiveTestimonials]);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B4292F] mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading testimonials...</p>
          </div>
        </div>
      </section>
    );
  }

  if (activeTestimonials.length === 0) {
    return null; // Don't show section if no active testimonials
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 text-lg">
            Hear from our satisfied customers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeTestimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              name={testimonial.name}
              img={testimonial.img}
              message={testimonial.message}
              rating={testimonial.rating}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
