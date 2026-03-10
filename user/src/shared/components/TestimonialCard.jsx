import { COLORS } from "../../style/theme";

const TestimonialCard = ({ name, img, message }) => {
  return (
    <div
      className="relative pt-20 pb-12 px-10 rounded-xl text-center shadow-sm"
      style={{ background: "#F9F3EC" }}>
      {/* Floating Image */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2">
        <img
          src={img}
          alt={name}
          className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white"
        />
      </div>

      <h3
        className="mt-10 text-xl font-semibold"
        style={{
          color: COLORS.primaryAlt,
          fontFamily: "Playfair Display, serif",
        }}>
        {name}
      </h3>

      <p
        className="mt-4 text-sm leading-relaxed"
        style={{
          color: COLORS.textAlt,
          fontFamily: "Inter, sans-serif",
        }}>
        {message}
      </p>
    </div>
  );
};

export default TestimonialCard;
