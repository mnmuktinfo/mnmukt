import React, { useState, useEffect } from "react";

const ImageGallery = ({ images, selectedIndex = 0, onSelectImage }) => {
  const [currentIndex, setCurrentIndex] = useState(selectedIndex);

  // Update currentIndex if selectedIndex changes from parent
  useEffect(() => {
    setCurrentIndex(selectedIndex);
  }, [selectedIndex]);

  if (!images || images.length === 0) return null;

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
    onSelectImage && onSelectImage(index);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="rounded-lg overflow-hidden shadow-md h-64 md:h-96">
        <img
          src={images[currentIndex]}
          alt={`Product view ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-all duration-300"
          loading="lazy"
        />
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => handleThumbnailClick(idx)}
              className={`rounded-md overflow-hidden border-2 transition ${
                currentIndex === idx
                  ? "border-blue-500 scale-105"
                  : "border-transparent"
              }`}>
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-16 object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
