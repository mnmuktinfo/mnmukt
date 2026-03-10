import React from "react";
import { FaStar } from "react-icons/fa";

const ReviewItem = ({ review }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex items-center mb-1">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={i < review.rating ? "text-yellow-400" : "text-gray-300"}
          />
        ))}
      </div>
      <p className="text-gray-800 italic">"{review.comment}"</p>
      <p className="text-sm text-gray-500 mt-1">- {review.author}</p>
    </div>
  );
};

export default ReviewItem;
