import { 
  collection, 
  doc, 
  getDoc, 
  setDoc,
  updateDoc,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../../../config/firebase";

export const homepageService = {
  // Get homepage configuration
  getHomepageConfig: async () => {
    try {
      const docRef = doc(db, "homepage", "config");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        // Return default config if none exists
        return {
          id: "config",
          heroBanner: {
            enabled: true,
            title: "Mulmul — Luxury Ethnic Wear",
            subtitle: "Crafted with Love",
            backgroundImage: "",
            ctaText: "Shop Now",
            ctaLink: "/collections/all"
          },
          featuredCollections: {
            enabled: true,
            title: "Winter Edit",
            collections: []
          },
          newArrivals: {
            enabled: true,
            title: "New Arrivals",
            subtitle: "Fresh styles added this week",
            limit: 8
          },
          basics: {
            enabled: true,
            title: "Basics",
            subtitle: "Essential styles for everyday",
            limit: 8
          },
          categories: {
            enabled: true,
            title: "Explore Collection",
            items: []
          },
          testimonials: {
            enabled: true,
            title: "What Our Customers Say"
          },
          videoSection: {
            enabled: true,
            videoUrl: "",
            thumbnail: "",
            title: "",
            description: ""
          },
          offerStrip: {
            enabled: true,
            text: "Free shipping on orders above ₹1999",
            backgroundColor: "#B4292F",
            textColor: "#FFFFFF"
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
      }
    } catch (error) {
      throw new Error(`Failed to fetch homepage config: ${error.message}`);
    }
  },

  // Update homepage configuration
  updateHomepageConfig: async (configData) => {
    try {
      const docRef = doc(db, "homepage", "config");
      await setDoc(docRef, {
        ...configData,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      throw new Error(`Failed to update homepage config: ${error.message}`);
    }
  },

  // Add collection to featured
  addFeaturedCollection: async (collectionData) => {
    try {
      const docRef = doc(db, "homepage", "config");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const currentData = docSnap.data();
        const updatedCollections = [
          ...(currentData.featuredCollections?.collections || []),
          collectionData
        ];
        
        await updateDoc(docRef, {
          "featuredCollections.collections": updatedCollections,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      throw new Error(`Failed to add featured collection: ${error.message}`);
    }
  },

  // Remove collection from featured
  removeFeaturedCollection: async (collectionId) => {
    try {
      const docRef = doc(db, "homepage", "config");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const currentData = docSnap.data();
        const updatedCollections = (currentData.featuredCollections?.collections || [])
          .filter(collection => collection.id !== collectionId);
        
        await updateDoc(docRef, {
          "featuredCollections.collections": updatedCollections,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      throw new Error(`Failed to remove featured collection: ${error.message}`);
    }
  }
};