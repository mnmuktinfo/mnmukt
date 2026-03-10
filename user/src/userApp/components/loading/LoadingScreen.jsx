import { IMAGES } from "../../../assets/images/index";

const LoadingScreen = ({ text = "Loading app experiences..." }) => {
  return (
    // 1. Container: Full screen, centered, with a modern backdrop blur
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[2px]">
      {/* 2. Animation Wrapper */}
      <div className="relative flex items-center justify-center w-24 h-24 mb-8">
        {/* The subtle background ring (static grey) */}
        <div className="absolute inset-0 border-[3px] border-gray-200 rounded-full"></div>

        {/* The spinning foreground ring */}
        {/* 🔥 Updated to 'border-t-red-600' to match your App Theme */}
        <div className="absolute inset-0 border-[3px] border-t-red-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>

        {/* The Logo: Centered inside the rings */}
        <div className="w-14 h-14 bg-white rounded-full p-2 flex items-center justify-center z-10 shadow-sm animate-pulse">
          <img
            src={IMAGES.brand.logo}
            alt="App Logo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* 3. Text */}
      {text && (
        <h2 className="text-gray-500 font-medium tracking-widest text-xs uppercase animate-pulse">
          {text}
        </h2>
      )}
    </div>
  );
};

export default LoadingScreen;
