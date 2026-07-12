// src/components/CheckoutAddressView.jsx
import React, { useState } from "react";
import {
  TruckIcon,
  MapPinIcon,
  ArrowLeftIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import AddressForm from "../form/AddressForm";
import { PAYMENT_GATEWAY } from "../../features/orders/services/schema";
import OrderSummaryModal from "./OrderSummaryModal";

/**
 * @typedef {Object} CheckoutAddressViewProps
 * @property {boolean} isEditing
 * @property {Function} onEditClick
 * @property {Function} onSaveAddress
 * @property {Object} formErrors
 * @property {Object} addressDraft
 * @property {Function} onAddressChange
 * @property {Function} onAddNewAddress
 * @property {boolean} pinLoading
 * @property {string} pinStatus
 * @property {boolean} shippingLoading
 * @property {Object} shippingInfo
 * @property {string} shippingError
 * @property {boolean} isLoading
 * @property {boolean} hasItems
 * @property {Function} onPayNow
 * @property {Function} onCashOnDelivery
 */

const CheckoutAddressView = ({
  isEditing = false,
  onEditClick,
  onSaveAddress,
  formErrors = {},
  addressDraft,
  savedAddresses = [],
  selectedAddress = null,
  onSelectAddress,
  onAddressChange,
  onAddNewAddress,
  pinLoading,
  pinStatus,
  shippingLoading,
  shippingInfo,
  shippingError,
  isLoading,
  hasItems,
  onPayNow,
  onCashOnDelivery,
  cart,
  pricing,
  updateQuantity,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState("list"); // 'list' | 'form'

  const formattedAddress = [
    addressDraft?.addressLine1,
    addressDraft?.addressLine2,
    addressDraft?.landmark,
    addressDraft?.city,
    addressDraft?.district,
    addressDraft?.state,
    addressDraft?.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  const handleOpenModal = () => {
    setModalView("list");
    setIsModalOpen(true);
    if (onEditClick) onEditClick();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveAndClose = async () => {
    const saved = await onSaveAddress();
    if (saved) handleCloseModal(); // was: always closed
  };

  return (
    <div className="flex flex-col h-full bg-[#f4f5f7] font-sans text-[#1a1a1a] relative w-full overflow-hidden">
      {/* 
        ========================================= 
        MAIN DRAWER VIEW 
        ========================================= 
      */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        <OrderSummaryModal
          cart={cart}
          pricing={pricing}
          updateQuantity={updateQuantity}
        />

        <div className="p-4 space-y-4">
          {/* Delivery Details Block */}
          <div className="bg-white border border-[#e2e8f0] shadow-sm p-4">
            <div className="flex justify-between items-center mb-4 border-b border-[#f1f4f8] pb-3">
              <h3 className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
                <MapPinIcon className="w-5 h-5 text-gray-500" />
                Delivery Details
              </h3>
              <button
                type="button"
                onClick={handleOpenModal}
                className="text-[13px] font-semibold text-[#0052cc] hover:underline uppercase tracking-wide">
                Change
              </button>
            </div>

            {addressDraft?.fullName ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[15px] text-gray-900">
                    {addressDraft.fullName}
                  </span>
                  {addressDraft.tag && (
                    <span className="px-2 py-0.5 bg-[#eff6ff] text-[#0052cc] text-[11px] font-bold uppercase tracking-wider">
                      {addressDraft.tag}
                    </span>
                  )}
                </div>

                <p className="text-[14px] text-[#4a5568] leading-snug pr-4">
                  {formattedAddress || "No address provided."}
                </p>

                <div className="flex flex-col gap-1.5 text-[13px] text-[#4a5568] pt-2">
                  {addressDraft.phone && (
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="w-4 h-4 text-gray-400" />
                      <span>{addressDraft.phone}</span>
                    </div>
                  )}
                  {addressDraft.email && (
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                      <span>{addressDraft.email}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 bg-[#f8fafc] border border-dashed border-gray-300">
                <p className="text-[13px] text-gray-500 mb-2">
                  No delivery address selected.
                </p>
                <button
                  onClick={handleOpenModal}
                  className="text-[14px] font-medium text-[#0052cc]">
                  Add an Address
                </button>
              </div>
            )}
          </div>

          {/* Shipping Serviceability Status */}
          <div className="bg-white border border-[#e2e8f0] shadow-sm p-4">
            {shippingLoading ? (
              <div className="flex items-center gap-3 text-[14px] text-gray-500">
                <div className="animate-spin h-4 w-4 border-b-2 border-gray-500 rounded-full" />
                Calculating delivery options...
              </div>
            ) : shippingError ? (
              <div className="text-[13px] text-[#d93025] bg-[#fce8e6] p-3 border border-[#fad2cf]">
                {shippingError}
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <TruckIcon
                  className="w-5 h-5 text-gray-700 mt-0.5"
                  strokeWidth={1.5}
                />
                <div>
                  <p className="text-[14px] font-semibold text-gray-900 mb-1">
                    Standard Delivery
                  </p>
                  <p className="text-[13px] text-gray-600 mb-1">
                    Estimated:{" "}
                    <span className="font-medium text-black">
                      {shippingInfo?.deliveryDate || "Pending"}
                    </span>
                  </p>
                  <p className="text-[13px] font-medium text-[#0f9d58]">
                    {shippingInfo?.shippingCharge === 0 || !shippingInfo
                      ? "Free shipping applied"
                      : `Shipping: ₹${shippingInfo.shippingCharge}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM PAYMENT CTAs */}
      {hasItems && (
        <div className="bg-white border-t border-[#e2e8f0] p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] z-10 flex-shrink-0">
          <div className="space-y-3">
            <button
              onClick={() => onPayNow(PAYMENT_GATEWAY.CASHFREE)}
              disabled={isLoading || !hasItems}
              className="w-full py-3.5 bg-black hover:bg-[#222222] disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold text-[13px] uppercase tracking-widest transition-colors flex justify-center items-center gap-2 rounded-none"
              type="button">
              {isLoading ? "Processing..." : "Pay Securely Now"}
            </button>

            <button
              onClick={() => onCashOnDelivery(PAYMENT_GATEWAY.COD)}
              disabled={isLoading || !hasItems}
              className="w-full py-3 bg-white border-2 border-gray-200 hover:border-black disabled:opacity-50 text-gray-900 font-bold text-[13px] uppercase tracking-widest transition-colors rounded-none"
              type="button">
              Cash on Delivery
            </button>
            <p className="text-center text-[11px] font-medium text-gray-400 tracking-wide uppercase pt-1">
              Secured Payments
            </p>
          </div>
        </div>
      )}

      {/* 
        ========================================= 
        INTERNAL SLIDE-OVER FOR ADDRESS (NO MODALS)
        This perfectly covers the drawer without breaking out.
        ========================================= 
      */}
      <div
        className={`absolute inset-0 z-50 bg-[#f4f5f7] flex flex-col transition-transform duration-300 ease-in-out ${
          isModalOpen ? "translate-x-0" : "translate-x-full"
        }`}>
        {/* Header */}
        <div className="bg-white p-4 border-b border-[#e2e8f0] flex items-center gap-3 shadow-sm flex-shrink-0">
          <button
            onClick={handleCloseModal}
            className="text-gray-600 hover:text-black transition-colors">
            <ArrowLeftIcon className="w-5 h-5" strokeWidth={2} />
          </button>
          <h2 className="text-[16px] font-bold text-gray-900 uppercase tracking-wide">
            {modalView === "list" ? "Saved Addresses" : "Add Address"}
          </h2>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col custom-scrollbar">
          {modalView === "list" ? (
            <>
              {/* Context Banner */}
              <div className="bg-white border border-[#e2e8f0] p-4 mb-4">
                <p className="text-[13px] text-[#4a5568] leading-relaxed">
                  Showing addresses associated with{" "}
                  <span className="font-bold text-black">
                    {addressDraft?.phone || "your account"}
                  </span>
                  .
                </p>
              </div>

              {/* Add New Trigger */}
              <div className="flex justify-end mb-3">
                <button
                  onClick={() => setModalView("form")}
                  className="text-[#0052cc] font-semibold text-[13px] hover:underline uppercase tracking-wide">
                  + Add New Address
                </button>
              </div>

              {/* Address List */}
              <div className="space-y-3 pb-6">
                {savedAddresses.map((address, index) => {
                  const isSelected = selectedAddress?.id === address.id;
                  return (
                    <label
                      key={address.id}
                      className={`block bg-white p-4 border cursor-pointer transition-colors ${
                        isSelected
                          ? "border-black ring-1 ring-black"
                          : "border-[#e2e8f0] hover:border-gray-400"
                      }`}>
                      <div className="flex items-start gap-4">
                        {/* Square Radio Replacement */}
                        <div className="flex-shrink-0 mt-0.5">
                          <div
                            className={`w-4 h-4 border flex items-center justify-center ${isSelected ? "bg-black border-black" : "border-gray-400 bg-white"}`}>
                            {isSelected && (
                              <CheckIcon
                                className="w-3 h-3 text-white"
                                strokeWidth={3}
                              />
                            )}
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-gray-900 text-[14px]">
                              {address.fullName}
                            </span>
                            {address.tag && (
                              <span className="bg-[#eff6ff] text-[#0052cc] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                {address.tag}
                              </span>
                            )}
                          </div>
                          <p className="text-[13px] text-[#4a5568] leading-relaxed">
                            {[
                              address.addressLine1,
                              address.addressLine2,
                              address.city,
                              address.state,
                              address.postalCode,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        </div>
                      </div>

                      {/* Hidden Native Radio */}
                      <input
                        type="radio"
                        name="selectedAddressModal"
                        className="sr-only"
                        checked={isSelected}
                        onChange={() => {
                          if (onSelectAddress) onSelectAddress(address);
                          handleCloseModal();
                        }}
                      />
                    </label>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col h-full bg-white border border-[#e2e8f0] p-4">
              <div className="flex-1">
                <AddressForm
                  form={addressDraft}
                  onChange={onAddressChange}
                  pinLoading={pinLoading}
                  pinStatus={pinStatus}
                  errors={formErrors}
                  onAddNewAddress={onAddNewAddress}
                />
              </div>

              <div className="pt-6 mt-auto border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={handleSaveAndClose}
                  disabled={isLoading}
                  className="w-full py-3.5 bg-black hover:bg-[#222222] disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold text-[13px] uppercase tracking-widest transition-colors rounded-none">
                  {isLoading ? "Saving..." : "Save Address"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* END SLIDE-OVER */}
    </div>
  );
};

export default CheckoutAddressView;
