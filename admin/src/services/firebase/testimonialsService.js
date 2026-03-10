import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../../config/firebase";

export const testimonialsService = {
  // Get all testimonials
  getAllTestimonials: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "testimonials"));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Failed to fetch testimonials: ${error.message}`);
    }
  },

  // Add new testimonial
  addTestimonial: async (testimonialData) => {
    try {
      const testimonialWithMetadata = {
        ...testimonialData,
        isActive: true,
        rating: testimonialData.rating || 5,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, "testimonials"), testimonialWithMetadata);
      return { id: docRef.id, ...testimonialWithMetadata };
    } catch (error) {
      throw new Error(`Failed to add testimonial: ${error.message}`);
    }
  },

  // Update testimonial
  updateTestimonial: async (id, testimonialData) => {
    try {
      const docRef = doc(db, "testimonials", id);
      await updateDoc(docRef, {
        ...testimonialData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw new Error(`Failed to update testimonial: ${error.message}`);
    }
  },

  // Delete testimonial
  deleteTestimonial: async (id) => {
    try {
      const docRef = doc(db, "testimonials", id);
      await deleteDoc(docRef);
    } catch (error) {
      throw new Error(`Failed to delete testimonial: ${error.message}`);
    }
  },

  // Toggle testimonial status
  toggleTestimonialStatus: async (id, isActive) => {
    try {
      const docRef = doc(db, "testimonials", id);
      await updateDoc(docRef, {
        isActive,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw new Error(`Failed to toggle testimonial status: ${error.message}`);
    }
  },

  // Get active testimonials for homepage
  getActiveTestimonials: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "testimonials"));
      return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(testimonial => testimonial.isActive)
        .sort((a, b) => new Date(b.createdAt?.toDate?.() || 0) - new Date(a.createdAt?.toDate?.() || 0));
    } catch (error) {
      throw new Error(`Failed to fetch active testimonials: ${error.message}`);
    }
  }
};