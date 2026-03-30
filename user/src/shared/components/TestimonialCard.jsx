const TestimonialCard = ({ name, img, message }) => {
  return (
    <div className="relative h-full flex flex-col justify-between pt-16 pb-8 px-6 md:px-8 rounded-xl text-center bg-[#f9f9f9] border border-gray-100 transition-all duration-300 hover:shadow-md">
      {/* Floating Image */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2">
        <img
          src={img}
          alt={name}
          className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-white shadow-sm"
        />
      </div>

      {/* Content */}
      <div className="mt-10 flex flex-col flex-grow justify-between">
        {/* Name */}
        <h3 className="text-[15px] md:text-[16px] font-medium text-gray-900">
          {name}
        </h3>

        {/* Message */}
        <p className="mt-3 text-[13px] md:text-[14px] text-gray-600 leading-relaxed line-clamp-4 min-h-[72px]">
          {message}
        </p>
      </div>
    </div>
  );
};

export default TestimonialCard;
