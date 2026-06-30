import React, { useMemo, useState } from "react";
import { useProducts } from "../../features/product/hook/useProducts";
import { useAuth } from "../../features/auth/context/UserContext";

// ⭐ Updated Star Component (Handles both filled and outlined pink stars)
const StarRating = ({ rating, size = "w-4 h-4", interactive = false, onHover, onClick }) => {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${size} text-[#e6007e] ${interactive ? "cursor-pointer transition-transform hover:scale-110" : ""}`}
          fill={star <= rating ? "currentColor" : "none"}
          stroke={star <= rating ? "none" : "currentColor"}
          strokeWidth={star <= rating ? "0" : "1.5"}
          viewBox="0 0 24 24"
          onMouseEnter={() => interactive && onHover && onHover(star)}
          onMouseLeave={() => interactive && onHover && onHover(0)}
          onClick={() => interactive && onClick && onClick(star)}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
};

const CustomerReviews = ({ product }) => {
  const [sort, setSort] = useState("recent");
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Review Form State
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { addReview } = useProducts();
  const { user } = useAuth(); // Assuming this returns { user } or { currentUser }

  // 1. DYNAMIC DATA TRANSFORM
  const data = useMemo(() => {
    const reviews = Array.isArray(product?.reviews) ? product.reviews : [];
    
    // Distribution
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      if (r.rating && dist[r.rating] !== undefined) {
        dist[r.rating]++;
      }
    });

    const totalReviews = reviews.length;
    const avg = totalReviews 
      ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(2)
      : 0;

    return {
      averageRating: avg,
      totalReviews,
      ratingDistribution: dist,
      reviews,
    };
  }, [product]);

  // 2. SORTING
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

  // 3. SUBMIT HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setErrorMsg("Please select a rating star.");
      return;
    }
    
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const reviewPayload = {
        rating,
        text: text.trim(),
        author: user?.displayName || user?.name || "Verified Customer",
        userId: user?.uid || user?.id || null,
        isVerified: !!user,
      };

      await addReview(product.id, reviewPayload);
      
      // Reset form
      setRating(0);
      setText("");
      setIsFormOpen(false);
      alert("Thank you for your review!");

    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 font-sans text-gray-800">
      <h2 className="text-[22px] font-medium text-center mb-8">
        Customer Reviews
      </h2>

      {/* ── Summary Section ── */}
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
          <button 
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
          >
            {isFormOpen ? "Cancel Review" : "Write a Review"}
          </button>
        </div>
      </div>

      {/* ── Write a Review Form ── */}
      {isFormOpen && (
        <div className="mb-10 bg-gray-50 p-6 rounded-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-[16px] font-bold mb-4">Leave Your Review</h3>
          
          {errorMsg && (
            <div className="mb-4 text-red-500 text-[13px] font-medium bg-red-50 p-3 rounded">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-2">Overall Rating *</label>
              <StarRating 
                rating={hoverRating || rating} 
                size="w-8 h-8"
                interactive={true}
                onHover={(val) => setHoverRating(val)}
                onClick={(val) => setRating(val)}
              />
            </div>
            
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-2">Review (Optional)</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full bg-white border border-gray-200 p-3 rounded focus:outline-none focus:border-black text-[14px]"
                rows="4"
                placeholder="What did you love? How was the fit?"
              />
            </div>

            <div className="flex justify-end">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-[#e6007e] text-white px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-[#d00070] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Sort Section ── */}
      {data.totalReviews > 0 && (
        <>
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

          {/* ── Reviews List ── */}
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
                      <span className="font-bold text-[16px] uppercase">
                        {review.author ? review.author[0] : "A"}
                      </span>
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

                {review.text && (
                  <p className="text-[14px] text-gray-700 leading-relaxed">
                    {review.text}
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {data.totalReviews === 0 && (
        <div className="text-center py-10 text-gray-500">
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      )}
    </div>
  );
};

export default CustomerReviews;
