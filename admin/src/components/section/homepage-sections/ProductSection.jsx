import React from "react";
import { SectionWrapper } from "./SectionWrapper";
import { TextInput } from "../../input/homepage_input/TextInput";
import { NumberInput } from "../../input/homepage_input/NumberInput";

const ProductSection = ({
  config,
  onSave,
  onToggle,
  sectionKey,
  title,
  defaultTitle = "",
  defaultSubtitle = "",
}) => {
  return (
    <SectionWrapper
      title={title}
      enabled={config?.[sectionKey]?.enabled}
      onToggle={(enabled) => onToggle(sectionKey, enabled)}>
      <div className="space-y-6">
        <TextInput
          label="Section Title"
          value={config?.[sectionKey]?.title || ""}
          onChange={(value) => onSave(sectionKey, { title: value })}
          placeholder={defaultTitle}
        />
        <TextInput
          label="Subtitle"
          value={config?.[sectionKey]?.subtitle || ""}
          onChange={(value) => onSave(sectionKey, { subtitle: value })}
          placeholder={defaultSubtitle}
        />
        <NumberInput
          label="Product Limit"
          value={config?.[sectionKey]?.limit || 8}
          onChange={(value) => onSave(sectionKey, { limit: value })}
          min={1}
          max={20}
        />
      </div>
    </SectionWrapper>
  );
};

export default ProductSection;
