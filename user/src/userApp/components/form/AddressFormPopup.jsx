import React from "react";
import { useAuth } from "../../features/auth/context/UserContext";
import AddressForm from "./AddressForm";

const AddressFormPopup = ({ isOpen, onCancel }) => {
  const { address, setAddress, saveAddress, actionLoading } = useAuth();

  const [errors, setErrors] = React.useState({});

  if (!isOpen) return null;

  // ================= VALIDATION =================
  const validate = () => {
    const err = {};

    if (!address.fullName || address.fullName.length < 3)
      err.fullName = "Enter valid name";

    if (!/^[6-9]\d{9}$/.test(address.phone))
      err.phone = "Invalid mobile number";

    if (!/^[1-9][0-9]{5}$/.test(address.postalCode))
      err.postalCode = "Invalid pincode";

    if (!address.addressLine1) err.addressLine1 = "Enter address details";

    if (!address.city) err.city = "City required";
    if (!address.state) err.state = "State required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!validate()) return;

    await saveAddress({
      ...address,
      fullName: address.fullName.trim(),
      phone: address.phone.trim(),
      country: "India",
      isDefault: true,
    });

    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl p-5">
        <h2 className="text-lg font-semibold mb-4">Add Delivery Address</h2>

        {/* FORM */}
        <AddressForm errors={errors} />

        {/* BUTTONS */}
        <button
          onClick={handleSubmit}
          disabled={actionLoading}
          className="w-full mt-4 bg-black text-white py-3 rounded-lg">
          {actionLoading ? "Saving..." : "Save Address"}
        </button>

        <button
          onClick={onCancel}
          className="w-full mt-2 border py-3 rounded-lg">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddressFormPopup;
