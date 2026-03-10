import { useState, useEffect } from "react";
import { testimonialsService } from "../services/firebase/testimonialsService";

export const useTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [activeTestimonials, setActiveTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all testimonials
  const loadTestimonials = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await testimonialsService.getAllTestimonials();
      setTestimonials(data);
    } catch (err) {
      setError(err.message);
      console.error("Error loading testimonials:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load active testimonials for homepage
  const loadActiveTestimonials = async () => {
    try {
      const data = await testimonialsService.getActiveTestimonials();
      setActiveTestimonials(data);
    } catch (err) {
      console.error("Error loading active testimonials:", err);
    }
  };

  // Add new testimonial
  const addTestimonial = async (testimonialData) => {
    try {
      const newTestimonial = await testimonialsService.addTestimonial(testimonialData);
      setTestimonials(prev => [...prev, newTestimonial]);
      // Also update active testimonials if the new one is active
      if (newTestimonial.isActive) {
        setActiveTestimonials(prev => [newTestimonial, ...prev]);
      }
      return newTestimonial;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update testimonial
  const updateTestimonial = async (id, testimonialData) => {
    try {
      await testimonialsService.updateTestimonial(id, testimonialData);
      setTestimonials(prev => 
        prev.map(testimonial => 
          testimonial.id === id 
            ? { ...testimonial, ...testimonialData }
            : testimonial
        )
      );
      
      // Update active testimonials if needed
      if (testimonialData.isActive !== undefined) {
        await loadActiveTestimonials();
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Delete testimonial
  const deleteTestimonial = async (id) => {
    try {
      await testimonialsService.deleteTestimonial(id);
      setTestimonials(prev => prev.filter(testimonial => testimonial.id !== id));
      // Also remove from active testimonials
      setActiveTestimonials(prev => prev.filter(testimonial => testimonial.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Toggle testimonial status
  const toggleTestimonialStatus = async (id, isActive) => {
    try {
      await testimonialsService.toggleTestimonialStatus(id, isActive);
      setTestimonials(prev => 
        prev.map(testimonial => 
          testimonial.id === id 
            ? { ...testimonial, isActive }
            : testimonial
        )
      );
      
      // Update active testimonials
      await loadActiveTestimonials();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Clear error
  const clearError = () => setError(null);

  // Load data on mount
  useEffect(() => {
    loadTestimonials();
    loadActiveTestimonials();
  }, []);

  return {
    // Data
    testimonials,
    activeTestimonials,
    
    // States
    loading,
    error,
    
    // Actions
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    toggleTestimonialStatus,
    loadTestimonials,
    loadActiveTestimonials,
    clearError
  };
};