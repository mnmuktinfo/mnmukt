import { SectionWrapper } from "./SectionWrapper";
import { TextInput } from "../../input/homepage_input/TextInput";
import { Plus, Trash2 } from "lucide-react";

const FeaturedCollectionsSection = ({ config, onSave, onToggle }) => {
  return (
    <SectionWrapper
      title="Featured Collections"
      enabled={config?.featuredCollections?.enabled}
      onToggle={(enabled) => onToggle("featuredCollections", enabled)}>
      <div className="space-y-6">
        <TextInput
          label="Section Title"
          value={config?.featuredCollections?.title || ""}
          onChange={(value) => onSave("featuredCollections", { title: value })}
          placeholder="Winter Edit"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Featured Collections
          </label>
          <div className="space-y-3">
            {config?.featuredCollections?.collections?.map(
              (collection, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <img
                    src={collection.image}
                    alt={collection.title}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {collection.title}
                    </p>
                    <p className="text-sm text-gray-500">{collection.path}</p>
                  </div>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            )}
            <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#B4292F] hover:bg-red-50 transition-all duration-200 flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              <span className="font-medium text-gray-700">Add Collection</span>
            </button>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default FeaturedCollectionsSection;
