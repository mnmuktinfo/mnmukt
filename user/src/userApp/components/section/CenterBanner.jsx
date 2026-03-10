import AdBanner from "../banner/AdBanner";

const CenterBanner = () => {
  return (
    <div>
      <AdBanner
        imageUrl="https://shopmulmul.com/cdn/shop/files/SHOP_THE_LOOK_NEW_THEME_DEKTOP_3f77ae49-69e1-475d-845b-1dba27bf9096.png?v=1760684188&width=2000"
        altText="Shop the Look Banner"
        title="SHOP THE LOOKS"
        subtitle="Curated outfits styled for every moment"
        buttonText="Explore Now"
        onButtonClick={() => console.log("Navigate to shop")}
      />
    </div>
  );
};

export default CenterBanner;
