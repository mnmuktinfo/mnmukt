import React, { useEffect, useState } from "react";
import TestimonialCard from "../../../shared/components/TestimonialCard";
import { getAllTestimonials } from "../../services/firebase/testimonialsService";

const TestimonialsList = () => {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const data = await getAllTestimonials();
      setTestimonials(data);
    };

    fetchTestimonials();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {testimonials.map((t) => (
        <TestimonialCard
          key={t.id}
          name={t.name}
          img={t.img}
          message={t.message}
        />
      ))}
    </div>
  );
};

export default TestimonialsList;
