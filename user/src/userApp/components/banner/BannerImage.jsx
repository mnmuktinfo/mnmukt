import React from "react";

const BannerImage = ({ image, height = "70vh" }) => {
  return (
    <div className="w-full overflow-hidden" style={{ height }}>
      <img src={image} alt="banner" className="w-full h-full object-cover" />
    </div>
  );
};

export default BannerImage;
