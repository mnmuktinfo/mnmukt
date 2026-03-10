import React from "react";

const RenderStep3 = ({ formData, itemName }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Confirm Your Enquiry</h3>

      <div className="bg-gray-50 p-4 rounded-md">
        <h4 className="font-medium mb-2">Product: {itemName}</h4>

        <p>
          <strong>Name:</strong> {formData.name}
        </p>
        <p>
          <strong>Email:</strong> {formData.email}
        </p>

        {formData.phone && (
          <p>
            <strong>Phone:</strong> {formData.phone}
          </p>
        )}

        <p>
          <strong>Quantity:</strong> {formData.quantity}
        </p>

        {formData.message && (
          <p>
            <strong>Message:</strong> {formData.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default RenderStep3;
