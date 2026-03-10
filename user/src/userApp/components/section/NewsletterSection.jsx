import React, { useState } from "react";
import { Bell } from "lucide-react";

const NewsletterSection = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Subscribe for Newsletter
          </h3>
          <p className="text-gray-600 text-sm">
            Become a part of the Biba family! Sign up to stay updated on our new
            product launches and much more.
          </p>
        </div>
        <button
          onClick={handleSubscribe}
          className={`ml-4 flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
            isSubscribed
              ? "bg-gray-500 hover:bg-gray-600 text-white"
              : "bg-purple-500 hover:bg-purple-600 text-white"
          }`}>
          <Bell size={16} />
          <span>{isSubscribed ? "Subscribed" : "Subscribe"}</span>
        </button>
      </div>
    </div>
  );
};

export default NewsletterSection;
