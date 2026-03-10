import { useEffect, useState } from "react";
import { getAllTestimonials } from "../services/testimonialsService";

const useTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await getAllTestimonials();
      setTestimonials(data);
      setLoading(false);
    };

    load();
  }, []);

  return { testimonials, loading };
};

export default useTestimonials;
