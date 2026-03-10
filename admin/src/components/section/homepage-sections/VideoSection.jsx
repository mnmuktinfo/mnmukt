import React from "react";
import { SectionWrapper } from "./SectionWrapper";
import { TextInput } from "../../input/homepage_input/TextInput";
import { ImageInput } from "../../input/homepage_input/ImageInput";

const VideoSection = ({ config, onSave, onToggle }) => {
  return (
    <SectionWrapper
      title="Video Section"
      enabled={config?.videoSection?.enabled}
      onToggle={(enabled) => onToggle("videoSection", enabled)}>
      <div className="space-y-6">
        <TextInput
          label="Video URL"
          value={config?.videoSection?.videoUrl || ""}
          onChange={(value) => onSave("videoSection", { videoUrl: value })}
          placeholder="https://youtube.com/embed/..."
        />
        <ImageInput
          label="Thumbnail Image URL"
          value={config?.videoSection?.thumbnail || ""}
          onChange={(value) => onSave("videoSection", { thumbnail: value })}
          placeholder="https://example.com/thumbnail.jpg"
        />
        <TextInput
          label="Video Title"
          value={config?.videoSection?.title || ""}
          onChange={(value) => onSave("videoSection", { title: value })}
          placeholder="Discover Our Collection"
        />
        <TextInput
          label="Video Description"
          value={config?.videoSection?.description || ""}
          onChange={(value) => onSave("videoSection", { description: value })}
          placeholder="Watch our latest collection video"
          multiline
        />
      </div>
    </SectionWrapper>
  );
};

export default VideoSection;
