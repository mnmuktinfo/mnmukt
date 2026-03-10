import React from "react";
import ReviewItem from "./ReviewItem";

const ReviewsSection = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Customer Reviews
        </h2>
        <p className="text-gray-500">No reviews yet.</p>
      </div>
    );
  }

  // Sort reviews by rating descending to get best reviews first
  const sortedReviews = [...reviews].sort((a, b) => b.rating - a.rating);

  // Optional: show top 3 reviews as “best reviews”
  const topReviews = sortedReviews.slice(0, 3);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Customer Reviews</h2>

      {/* Best Reviews */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Top Reviews
        </h3>
        <div className="space-y-4">
          {topReviews.map((review, index) => (
            <ReviewItem key={index} review={review} />
          ))}
        </div>
      </div>

      {/* All Reviews */}
      <div className="space-y-4">
        {sortedReviews.map((review, index) => (
          <ReviewItem key={index} review={review} />
        ))}
      </div>
    </div>
  );
};

export default ReviewsSection;
