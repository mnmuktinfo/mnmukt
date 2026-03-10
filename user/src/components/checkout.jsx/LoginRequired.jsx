import { AlertCircle } from "lucide-react";

const LoginRequired = ({ navigate }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
      <AlertCircle className="mx-auto text-orange-500 mb-4" size={48} />
      <h2 className="text-2xl font-bold mb-4">Login Required</h2>
      <p className="mb-6">Please login to proceed with checkout</p>
      <button
        onClick={() => navigate("/login")}
        className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600">
        Login Now
      </button>
    </div>
  </div>
);

export default LoginRequired;
