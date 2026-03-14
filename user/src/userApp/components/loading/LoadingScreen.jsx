import { IMAGES } from "../../../assets/images/index";

const LoadingScreen = ({ text = "Please wait..." }) => {
  return (
    // 1. Container: Pure solid white, highest z-index
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white font-sans transition-opacity duration-300">
      {/* 2. The Logo: No heavy rings, just a clean, gentle pulse */}
      <div className="w-12 h-12 md:w-14 md:h-14 mb-5 animate-pulse">
        <img
          src={IMAGES.brand.logo}
          alt="Mnmukt Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {/* 3. Text: Minimalist, highly spaced typography */}
      {text && (
        <h2 className="text-gray-400 font-bold tracking-[0.25em] text-[10px] uppercase animate-pulse">
          {text}
        </h2>
      )}
    </div>
  );
};

export default LoadingScreen;
