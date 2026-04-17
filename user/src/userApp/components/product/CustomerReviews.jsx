import React, { useMemo, useState } from "react";

// ⭐ Updated Star Component (Handles both filled and outlined pink stars)
const StarRating = ({ rating, size = "w-4 h-4" }) => {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${size} text-[#e6007e]`} // Matching the exact pink shade
          fill={star <= rating ? "currentColor" : "none"}
          stroke={star <= rating ? "none" : "currentColor"}
          strokeWidth={star <= rating ? "0" : "1.5"}
          viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
};

// 🧪 Static Data (Updated to resemble the screenshot's state)
const mockReviews = [
  {
    id: 1,
    rating: 4,
    date: "2026-02-27",
    author: "N Raval",
    isVerified: true,
    text: "It's fine... I could have taken a smaller size but then the joint in the fabric above the chest level would have been too tight. Considering how loose the rest of the top is the section at the joint should have been a bit looser than it is . . This is a comment / view as I know tailoring.",
  },
  {
    id: 2,
    rating: 5,
    date: "2026-01-15",
    author: "Aparna",
    isVerified: true,
    text: "Great fit! And beautiful.",
  },
];

// 🔁 Transform Logic (calculating average exactly like the image)
const transformReviews = (reviews) => {
  const totalReviews = 13; // Hardcoded to match the 13 reviews from your image distribution
  const ratingDistribution = { 5: 10, 4: 3, 3: 0, 2: 0, 1: 0 };

  let total = 10 * 5 + 3 * 4; // 50 + 12 = 62

  return {
    averageRating: totalReviews ? (total / totalReviews).toFixed(2) : 0,
    totalReviews,
    ratingDistribution,
    reviews,
  };
};

const CustomerReviews = () => {
  const [sort, setSort] = useState("recent");
  const data = useMemo(() => transformReviews(mockReviews), []);

  const sortedReviews = useMemo(() => {
    const arr = [...data.reviews];
    if (sort === "recent")
      return arr.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (sort === "highest") return arr.sort((a, b) => b.rating - a.rating);
    if (sort === "lowest") return arr.sort((a, b) => a.rating - b.rating);
    return arr;
  }, [sort, data.reviews]);

  // Format date to MM/DD/YYYY
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${date.getFullYear()}`;
  };

  return (
    <div className="max-w-5xl mx-auto p-6 font-sans text-gray-800">
      <h2 className="text-[22px] font-medium text-center mb-8">
        Customer Reviews
      </h2>

      {/* Summary Section */}
      <div className="flex flex-col md:flex-row items-center justify-center md:gap-12 gap-8 mb-4 pb-8 border-b border-gray-100">
        {/* Left: Overall Rating */}
        <div className="flex flex-col items-center md:items-end justify-center min-w-[200px]">
          <div className="flex items-center gap-3 mb-1">
            <StarRating
              rating={Math.round(data.averageRating)}
              size="w-[18px] h-[18px]"
            />
            <span className="text-[15px] font-medium text-gray-700">
              {data.averageRating} out of 5
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
            <span>Based on {data.totalReviews} reviews</span>
            <svg
              className="w-[18px] h-[18px] text-teal-400"
              viewBox="0 0 24 24"
              fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
        </div>

        {/* Vertical Divider 1 */}
        <div className="hidden md:block w-px h-[100px] bg-gray-200"></div>

        {/* Middle: Rating Distribution */}
        <div className="flex flex-col gap-2 min-w-[250px]">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = data.ratingDistribution[star];
            const percentage = data.totalReviews
              ? (count / data.totalReviews) * 100
              : 0;

            return (
              <div key={star} className="flex items-center gap-3 text-sm">
                <StarRating rating={star} size="w-3.5 h-3.5" />
                <div className="flex-1 h-3 bg-gray-100 relative">
                  <div
                    className="absolute top-0 left-0 h-full bg-[#111]"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-5 text-right text-gray-500 text-[13px]">
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Vertical Divider 2 */}
        <div className="hidden md:block w-px h-[100px] bg-gray-200"></div>

        {/* Right: Write Review Button */}
        <div className="min-w-[200px] flex justify-center">
          <button className="bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors">
            Write a Review
          </button>
        </div>
      </div>

      {/* Sort Section */}
      <div className="flex justify-start border-b border-gray-100 pb-2 mb-6 relative">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="appearance-none bg-transparent cursor-pointer text-sm font-medium pr-6 focus:outline-none">
          <option value="recent">Most Recent</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
        </select>
        {/* Custom Chevron for select */}
        <svg
          className="w-4 h-4 absolute left-[88px] top-1 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Reviews List */}
      <div className="space-y-8">
        {sortedReviews.map((review) => (
          <div
            key={review.id}
            className="border-b border-gray-100 pb-8 last:border-0">
            <div className="flex justify-between items-start mb-4">
              <StarRating rating={review.rating} />
              <span className="text-[13px] text-gray-400">
                {formatDate(review.date)}
              </span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              {/* Avatar Icon Box */}
              <div className="relative">
                <div className="w-10 h-10 bg-gray-100 rounded-sm flex items-center justify-center text-gray-600">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                </div>
                {/* Tiny Avatar Checkmark */}
                {review.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-black rounded-sm w-3.5 h-3.5 flex items-center justify-center">
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Author & Badge */}
              <div className="flex items-center gap-2">
                <span className="font-medium text-[15px]">{review.author}</span>
                {review.isVerified && (
                  <span className="bg-black text-white text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm">
                    Verified
                  </span>
                )}
              </div>
            </div>

            <p className="text-[14px] text-gray-700 leading-relaxed">
              {review.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerReviews;
