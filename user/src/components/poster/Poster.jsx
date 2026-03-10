import { COLORS } from "../../style/theme";

const Poster = ({
  imageUrl,
  altText = "Poster",
  title,
  subtitle,
  buttonText,
  onButtonClick,
}) => {
  return (
    <div className="relative w-full   md:h-[65vh] lg:h-[55vh] overflow-hidden  group">
      {/* Background Image */}
      <img
        src={imageUrl}
        alt={altText}
        className="w-full md:h-full  transition-transform duration-[2.5s] group-hover:scale-110"
      />

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.65))",
        }}
      />

      {/* Text Content */}
      {(title || subtitle || buttonText) && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center text-white px-4">
          {title && (
            <h2 className="text-2xl md:text-4xl font-playfair font-semibold drop-shadow-lg">
              {title}
            </h2>
          )}

          {subtitle && (
            <p className="mt-2 text-sm md:text-base opacity-90">{subtitle}</p>
          )}

          {buttonText && (
            <button
              onClick={onButtonClick}
              className="mt-4 px-6 py-2 text-sm md:text-base rounded-full shadow-lg backdrop-blur-md bg-white/25 hover:bg-white/40 transition"
              style={{ color: COLORS.light }}>
              {buttonText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Poster;
