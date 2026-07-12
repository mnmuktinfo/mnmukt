import React from "react";

export const ImageGridRenderer = ({ data }) => {
  const items = data?.items ?? [];
  if (!items.length) return null;
  return (
    <div className="px-4 sm:px-8 py-6">
      {data.title && (
        <h2 className="text-xl font-bold text-center mb-4">{data.title}</h2>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((item, i) => (
          <a
            key={item.name ?? i}
            href={`/category/${encodeURIComponent(item.name)}`}
            className="block">
            <img
              src={item.image}
              alt={item.name}
              className="w-full aspect-square object-cover rounded-lg"
              loading="lazy"
            />
            <p className="mt-2 text-sm font-medium text-center">{item.name}</p>
          </a>
        ))}
      </div>
    </div>
  );
};

export const LogoStripRenderer = ({ data }) => {
  const items = data?.items ?? [];
  if (!items.length) return null;
  return (
    <div className="w-full overflow-x-auto py-4">
      <div className="flex items-center gap-8 px-4 min-w-max">
        {items.map((item, i) => (
          <img
            key={item.name ?? i}
            src={item.image}
            alt={item.name}
            className="h-10 sm:h-12 object-contain opacity-80"
            loading="lazy"
          />
        ))}
      </div>
    </div>
  );
};

export const ImageStripRenderer = ({ data }) => {
  const images = data?.images ?? [];
  if (!images.length) return null;
  return (
    <div className="px-4 sm:px-8 py-6">
      {(data.title || data.handle) && (
        <div className="text-center mb-4">
          {data.title && <h2 className="text-xl font-bold">{data.title}</h2>}
          {data.handle && (
            <p className="text-sm text-gray-500">@{data.handle}</p>
          )}
        </div>
      )}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            className="w-full aspect-square object-cover rounded-md"
            loading="lazy"
          />
        ))}
      </div>
    </div>
  );
};

export const TextStripRenderer = ({ data }) => {
  if (!data?.text) return null;
  return (
    <div className="w-full bg-[#111] text-white text-xs sm:text-sm text-center py-2 px-4 tracking-wide">
      {data.text}
    </div>
  );
};

export const FlashSaleRenderer = ({ data }) => {
  if (!data?.banner) return null;
  if (data.endTime && new Date(data.endTime).getTime() < Date.now())
    return null;
  return (
    <a
      href={data.productSectionKey ? `#${data.productSectionKey}` : undefined}
      aria-label={data.title || "Flash Sale"}
      className="block w-full">
      <img
        src={data.banner}
        alt={data.title || "Flash Sale"}
        className="w-full h-auto object-cover"
        loading="lazy"
      />
    </a>
  );
};

/* Looked up by `kind` at render time. Add a new kind here + in
   homepageSchema.js and every future section of that kind renders with
   zero extra code anywhere else. */
export const KIND_RENDERERS = {
  imageGrid: ImageGridRenderer,
  logoStrip: LogoStripRenderer,
  imageStrip: ImageStripRenderer,
  textStrip: TextStripRenderer,
  flashSale: FlashSaleRenderer,
};
