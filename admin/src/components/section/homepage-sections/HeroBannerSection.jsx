import React from "react";
import { SectionWrapper } from "./SectionWrapper";
import { TextInput } from "../../input/homepage_input/TextInput";
import { ImageInput } from "../../input/homepage_input/ImageInput";

const HeroBannerSection = ({ config, onSave, onToggle }) => {
  return (
    <SectionWrapper
      title="Hero Banner"
      enabled={config?.heroBanner?.enabled}
      onToggle={(enabled) => onToggle("heroBanner", enabled)}>
      <div className="space-y-6">
        <TextInput
          label="Title"
          value={config?.heroBanner?.title || ""}
          onChange={(value) => onSave("heroBanner", { title: value })}
          placeholder="Enter hero banner title"
        />
        <TextInput
          label="Subtitle"
          value={config?.heroBanner?.subtitle || ""}
          onChange={(value) => onSave("heroBanner", { subtitle: value })}
          placeholder="Enter hero banner subtitle"
        />
        <ImageInput
          label="Background Image URL"
          value={config?.heroBanner?.backgroundImage || ""}
          onChange={(value) => onSave("heroBanner", { backgroundImage: value })}
          placeholder="https://example.com/hero-image.jpg"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            label="CTA Text"
            value={config?.heroBanner?.ctaText || ""}
            onChange={(value) => onSave("heroBanner", { ctaText: value })}
            placeholder="Shop Now"
          />
          <TextInput
            label="CTA Link"
            value={config?.heroBanner?.ctaLink || ""}
            onChange={(value) => onSave("heroBanner", { ctaLink: value })}
            placeholder="/collections/all"
          />
        </div>
      </div>
    </SectionWrapper>
  );
};

export default HeroBannerSection;
