import { ArrowLeft, Eye } from "lucide-react";

const HomePageSetUpHeader = () => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
      <div>
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-4 group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Homepage Setup
        </h1>
        <p className="text-gray-600">
          Customize your homepage sections and content
        </p>
      </div>
      <button
        onClick={() => window.open("/", "_blank")}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors mt-4 lg:mt-0">
        <Eye className="w-4 h-4" />
        View Homepage
      </button>
    </div>
  );
};

export default HomePageSetUpHeader;
