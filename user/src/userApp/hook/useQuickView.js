import { useState, useEffect } from "react";

export const useQuickView = (product) => {
  // active image
  const [activeImage, setActiveImage] = useState(null);

  // user selected options
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  // quantity
  const [qty, setQty] = useState(1);

  // responsive UI flag
  const [isMobile, setIsMobile] = useState(false);

  // prepare all images (banner + others)
  const images = [
    product?.banner,
    ...(Array.isArray(product?.image) ? product.image.filter(Boolean) : []),
  ];

  // set default active image
  useEffect(() => {
    if (product) setActiveImage(images[0]);
  }, [product]);

  // detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return {
    images,
    activeImage,
    setActiveImage,
    selectedSize,
    setSelectedSize,
    selectedColor,
    setSelectedColor,
    qty,
    setQty,
    isMobile,
  };
};
