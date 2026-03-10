import React from "react";
import HeroBannerSection from "./HeroBannerSection";
import FeaturedCollectionsSection from "./FeaturedCollectionsSection";
import ProductSection from "./ProductSection";
import CategoriesSection from "./CategoriesSection";
import VideoSection from "./VideoSection";
import OfferStripSection from "./OfferStripSection";
import TestimonialsSection from "./TestimonialsSection";

const SectionRenderer = ({ activeTab, config, onSave, onToggle }) => {
  const renderSection = () => {
    switch (activeTab) {
      case "hero":
        return (
          <HeroBannerSection
            config={config}
            onSave={onSave}
            onToggle={onToggle}
          />
        );

      case "featuredCollections":
        return (
          <FeaturedCollectionsSection
            config={config}
            onSave={onSave}
            onToggle={onToggle}
          />
        );

      case "newArrivals":
        return (
          <ProductSection
            config={config}
            onSave={onSave}
            onToggle={onToggle}
            sectionKey="newArrivals"
            title="New Arrivals"
            defaultTitle="New Arrivals"
            defaultSubtitle="Fresh styles added this week"
          />
        );

      case "basics":
        return (
          <ProductSection
            config={config}
            onSave={onSave}
            onToggle={onToggle}
            sectionKey="basics"
            title="Basics Collection"
            defaultTitle="Basics"
            defaultSubtitle="Essential styles for everyday"
          />
        );

      case "categories":
        return (
          <CategoriesSection
            config={config}
            onSave={onSave}
            onToggle={onToggle}
          />
        );

      case "videoSection":
        return (
          <VideoSection config={config} onSave={onSave} onToggle={onToggle} />
        );

      case "offerStrip":
        return (
          <OfferStripSection
            config={config}
            onSave={onSave}
            onToggle={onToggle}
          />
        );

      case "testimonials":
        return (
          <TestimonialsSection
            config={config}
            onSave={onSave}
            onToggle={onToggle}
          />
        );

      default:
        return null;
    }
  };

  return <>{renderSection()}</>;
};

export default SectionRenderer;
