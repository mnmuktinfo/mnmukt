import { User, Mail, Phone, MapPin, AlertCircle } from "lucide-react";

const ShippingDetails = ({ user, deliveryAddress, formErrors, navigate }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <iframe
        src="https://www.solarsystemscope.com/iframe"
        width="500"
        height="400"
        style={{
          minWidth: "500px",
          minHeight: "400px",
          border: "2px solid #0f5c6e",
        }}
      />

      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
        <User className="mr-2" size={20} /> Shipping Details
      </h2>

      {formErrors.address && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-700 text-sm flex items-center">
            <AlertCircle className="mr-2" size={16} />
            {formErrors.address}
          </p>
        </div>
      )}

      <div className="space-y-2 text-gray-700">
        <p className="font-medium">{user.name}</p>
        <p className="flex items-center">
          <Mail className="mr-2" size={16} />
          {user.email}
        </p>
        {user.phone && (
          <p className="flex items-center">
            <Phone className="mr-2" size={16} />
            {user.phone}
          </p>
        )}
        <div className="flex items-start justify-between">
          <div className="flex items-start flex-1">
            <MapPin className="mr-2 mt-1" size={16} />
            <span className={!user.address ? "text-red-500" : ""}>
              {deliveryAddress}
            </span>
          </div>
          <button
            onClick={() => navigate("/profile?tab=address")}
            className="text-orange-600 hover:text-orange-700 text-sm font-medium ml-2">
            Change
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShippingDetails;
