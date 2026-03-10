import React from "react";
import { SectionWrapper } from "./SectionWrapper";
import { TextInput } from "../../input/homepage_input/TextInput";
import { ColorInput } from "../../input/homepage_input/ColorInput";

const OfferStripSection = ({ config, onSave, onToggle }) => {
  return (
    <SectionWrapper
      title="Offer Strip"
      enabled={config?.offerStrip?.enabled}
      onToggle={(enabled) => onToggle("offerStrip", enabled)}>
      <div className="space-y-6">
        <TextInput
          label="Offer Text"
          value={config?.offerStrip?.text || ""}
          onChange={(value) => onSave("offerStrip", { text: value })}
          placeholder="Free shipping on orders above ₹1999"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ColorInput
            label="Background Color"
            value={config?.offerStrip?.backgroundColor || "#B4292F"}
            onChange={(value) =>
              onSave("offerStrip", { backgroundColor: value })
            }
          />
          <ColorInput
            label="Text Color"
            value={config?.offerStrip?.textColor || "#FFFFFF"}
            onChange={(value) => onSave("offerStrip", { textColor: value })}
          />
        </div>
        <div className="p-4 border border-gray-200 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
          <div
            className="p-3 text-center rounded"
            style={{
              backgroundColor: config?.offerStrip?.backgroundColor || "#B4292F",
              color: config?.offerStrip?.textColor || "#FFFFFF",
            }}>
            {config?.offerStrip?.text || "Free shipping on orders above ₹1999"}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default OfferStripSection;
