import React, { useState } from "react";
import {
  TruckIcon,
  MapPinIcon,
  ArrowLeftIcon,
  PhoneIcon,
  EnvelopeIcon,
  PencilSquareIcon,
  TrashIcon,
  StarIcon,
  XMarkIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import AddressForm from "../form/AddressForm";
import OrderSummaryModal from "./OrderSummaryModal";
import { BellAlertIcon } from "@heroicons/react/20/solid";

const CheckoutAddressView = ({
  onSaveAddress,
  formErrors = {},
  addressDraft,
  savedAddresses = [],
  selectedAddress = null,
  onSelectAddress,
  onAddressChange,
  onAddNewAddress,
  onEditAddress,
  onDeleteAddress,
  onSetDefaultAddress,
  isGuest = false,
  listLoading = false,
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
  onBack,
  onClose,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState("list");
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const currentAddress = selectedAddress || addressDraft;

  const formattedAddress = [
    currentAddress?.addressLine1,
    currentAddress?.addressLine2,
    currentAddress?.landmark,
    currentAddress?.city,
    currentAddress?.district,
    currentAddress?.state,
    currentAddress?.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  const handleOpenModal = () => {
    setModalView(savedAddresses.length > 0 ? "list" : "form");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPendingDeleteId(null);
  };

  const handleBackModal = () => {
    if (modalView === "form" && savedAddresses.length > 0) {
      setModalView("list");
    } else {
      handleCloseModal();
    }
  };

  const handleSaveAndClose = async () => {
    const saved = await onSaveAddress();
    if (saved) handleCloseModal();
  };

  const handleAddNewClick = () => {
    onAddNewAddress?.();
    setModalView("form");
  };

  const handleEditClick = (e, address) => {
    e.stopPropagation();
    onEditAddress?.(address);
    setModalView("form");
  };

  const handleDeleteClick = (e, address) => {
    e.stopPropagation();
    if (pendingDeleteId === address.id) {
      onDeleteAddress?.(address);
      setPendingDeleteId(null);
    } else {
      setPendingDeleteId(address.id);
    }
  };

  const handleSetDefaultClick = (e, address) => {
    e.stopPropagation();
    onSetDefaultAddress?.(address);
  };

  return (
    <div className="flex flex-col h-full bg-white font-sans text-gray-900 relative w-full overflow-hidden">
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0 bg-white z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1 text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-medium text-gray-900">
            Shipping Details
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* ========================================= 
        MAIN DRAWER VIEW 
        ========================================= */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        <OrderSummaryModal
          cart={cart}
          pricing={pricing}
          updateQuantity={updateQuantity}
        />

        <div className="p-5 space-y-6">
          {/* Delivery Details Block */}
          <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-5">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <h3 className="text-[15px] font-medium text-gray-900 flex items-center gap-2">
                <MapPinIcon className="w-5 h-5 text-pink-500" />
                Delivery Address
              </h3>
              <button
                type="button"
                onClick={handleOpenModal}
                className="text-[12px] font-semibold text-pink-500 hover:text-pink-600 uppercase tracking-wide transition-colors">
                {savedAddresses.length > 0 ? "Change" : "Add"}
              </button>
            </div>

            {isGuest && (
              <p className="text-[11px] text-gray-500 mb-3 -mt-1 italic">
                Guest checkout — addresses are saved on this device only.
              </p>
            )}

            {currentAddress?.fullName ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[15px] text-gray-900">
                    {currentAddress.fullName}
                  </span>
                  {currentAddress.tag && (
                    <span className="px-2 py-0.5 bg-pink-50 text-pink-600 border border-pink-100 text-[10px] font-bold uppercase tracking-wider rounded-sm">
                      {currentAddress.tag}
                    </span>
                  )}
                </div>

                <p className="text-[14px] text-gray-600 leading-relaxed pr-4 font-light">
                  {formattedAddress || "No address provided."}
                </p>

                <div className="flex flex-col gap-2 text-[13px] text-gray-600 pt-2">
                  {currentAddress.phone && (
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="w-4 h-4 text-gray-400" />
                      <span>{currentAddress.phone}</span>
                    </div>
                  )}
                  {currentAddress.email && (
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                      <span>{currentAddress.email}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 border border-dashed border-gray-300 rounded-sm">
                <p className="text-[13px] text-gray-500 mb-3">
                  No delivery address selected.
                </p>
                <button
                  onClick={handleOpenModal}
                  className="text-[13px] font-semibold text-pink-500 uppercase tracking-wide">
                  + Add an Address
                </button>
              </div>
            )}
          </div>

          {/* Shipping Serviceability Status */}
          <div className="bg-pink-50/30 border border-pink-100 rounded-sm p-4 text-[13px]">
            {shippingLoading ? (
              <div className="flex items-center gap-3 text-gray-600">
                <div className="animate-spin h-4 w-4 border-b-2 border-pink-500 rounded-full" />
                Checking delivery availability...
              </div>
            ) : shippingError ? (
              <div className="text-red-600 flex items-center gap-2">
                <BellAlertIcon className="w-4 h-4" />
                {shippingError}
              </div>
            ) : shippingInfo?.available ? (
              <div className="flex items-start gap-3">
                <TruckIcon
                  className="w-5 h-5 text-pink-500 mt-0.5"
                  strokeWidth={1.5}
                />
                <div className="space-y-1.5">
                  <p className="font-semibold text-pink-600">
                    Delivery Available
                  </p>
                  <p className="text-gray-600">
                    Courier:{" "}
                    <span className="font-medium text-gray-900">
                      {shippingInfo.courier}
                    </span>
                  </p>
                  <p className="text-gray-600">
                    Estimated Delivery:{" "}
                    <span className="font-medium text-gray-900">
                      {shippingInfo.etd ||
                        `${shippingInfo.estimatedDeliveryDays} Days`}
                    </span>
                  </p>
                  <p className="text-gray-600">
                    Cash on Delivery:{" "}
                    <span
                      className={`font-semibold ${
                        shippingInfo.codAvailable
                          ? "text-green-600"
                          : "text-red-500"
                      }`}>
                      {shippingInfo.codAvailable
                        ? "Available"
                        : "Not Available"}
                    </span>
                  </p>
                  <p className="font-semibold text-pink-600 mt-1 pt-1 border-t border-pink-100">
                    {pricing?.subtotal >= 1000
                      ? "🎉 Eligible for Free Shipping"
                      : `Shipping Charge: ₹${Number(
                          shippingInfo.freightCharge || 0,
                        ).toFixed(2)}`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-red-600 flex items-center gap-2">
                <BellAlertIcon className="w-4 h-4" />
                Delivery is not available for this PIN code.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM PAYMENT CTAs - Fixed visually at bottom via flex-shrink-0 */}
      {hasItems && (
        <div className="bg-white p-4 border-t border-gray-100 shadow-[0_-4px_15px_rgba(0,0,0,0.03)] z-10 flex-shrink-0 pb-safe md:pb-4">
          <div className="space-y-3">
            {/* Pay Securely Button */}
            <button
              onClick={onPayNow}
              disabled={
                isLoading ||
                !hasItems ||
                !shippingInfo?.available ||
                !currentAddress
              }
              className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 px-4 rounded-sm flex items-center justify-between transition-colors duration-200"
              type="button">
              <div className="flex items-center gap-3 w-full justify-center">
                <span className="font-semibold text-[13px] tracking-[0.2em] uppercase">
                  {isLoading ? "Processing..." : "Pay Securely"}
                </span>
                {!isLoading && (
                  <div className="flex items-center gap-1.5 ml-2">
                    <div className="bg-white rounded-full w-6 h-6 flex items-center justify-center text-[8px] font-bold text-blue-900">
                      Pay
                    </div>
                    <div className="bg-white rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-bold text-purple-700">
                      Pe
                    </div>
                    <div className="bg-white rounded-full w-6 h-6 flex items-center justify-center text-[12px] font-bold text-gray-800">
                      G
                    </div>
                  </div>
                )}
              </div>
              <ChevronRightIcon
                className="w-5 h-5 text-white"
                strokeWidth={2.5}
              />
            </button>

            {/* Cash on Delivery Button */}
            <button
              onClick={onCashOnDelivery}
              disabled={
                isLoading ||
                !hasItems ||
                !shippingInfo?.codAvailable ||
                !currentAddress
              }
              className="w-full py-3.5 border border-pink-500 rounded-sm hover:bg-pink-50 disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-transparent text-pink-600 font-semibold text-[13px] uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2"
              type="button">
              Cash on Delivery
            </button>
          </div>
        </div>
      )}

      {/* ========================================= 
        INTERNAL SLIDE-OVER FOR ADDRESS
        ========================================= */}
      <div
        className={`absolute inset-0 z-50 bg-white flex flex-col transition-transform duration-300 ease-in-out ${
          isModalOpen ? "translate-x-0" : "translate-x-full"
        }`}>
        {/* Header */}
        <div className="bg-white p-5 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={handleBackModal}
            className="text-gray-900 hover:bg-gray-100 p-1 rounded-full transition-colors">
            <ArrowLeftIcon className="w-5 h-5" strokeWidth={2} />
          </button>
          <h2 className="text-lg font-medium text-gray-900">
            {modalView === "list" ? "Saved Addresses" : "Add Address"}
          </h2>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {modalView === "list" ? (
            <div className="p-5 flex-1">
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleAddNewClick}
                  className="text-pink-500 font-semibold text-[12px] hover:underline uppercase tracking-widest">
                  + Add New Address
                </button>
              </div>

              {listLoading ? (
                <div className="flex items-center justify-center gap-2 text-[13px] text-gray-500 py-10">
                  <div className="animate-spin h-4 w-4 border-b-2 border-pink-500 rounded-full" />
                  Loading addresses...
                </div>
              ) : savedAddresses.length === 0 ? (
                <div className="text-center py-10 text-[13px] text-gray-500">
                  No saved addresses yet.
                </div>
              ) : (
                <div className="space-y-4 pb-6">
                  {savedAddresses.map((address) => {
                    const isSelected = selectedAddress?.id === address.id;
                    const confirmingDelete = pendingDeleteId === address.id;

                    return (
                      <div
                        key={address.id}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onClick={() => {
                          onSelectAddress?.(address);
                          handleCloseModal();
                        }}
                        className={`block bg-white p-4 border rounded-sm cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? "border-pink-500 ring-1 ring-pink-500 shadow-sm bg-pink-50/30"
                            : "border-gray-200 hover:border-gray-300"
                        }`}>
                        <div className="flex items-start gap-4">
                          {/* Circular Radio */}
                          <div className="flex-shrink-0 mt-0.5">
                            <div
                              className={`w-4 h-4 border rounded-full flex items-center justify-center transition-colors ${
                                isSelected
                                  ? "border-pink-500"
                                  : "border-gray-400"
                              }`}>
                              {isSelected && (
                                <div className="w-2 h-2 bg-pink-500 rounded-full" />
                              )}
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="font-medium text-gray-900 text-[14px]">
                                {address.fullName}
                              </span>
                              {address.tag && (
                                <span className="bg-pink-50 text-pink-600 border border-pink-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-sm">
                                  {address.tag}
                                </span>
                              )}
                              {address.isDefault && (
                                <span className="flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-600">
                                  <StarIconSolid className="w-3 h-3" /> Default
                                </span>
                              )}
                            </div>
                            <p className="text-[13px] text-gray-600 leading-relaxed font-light">
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

                        {/* Actions */}
                        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
                          {onEditAddress && (
                            <button
                              type="button"
                              onClick={(e) => handleEditClick(e, address)}
                              className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-pink-600 uppercase tracking-wider">
                              <PencilSquareIcon className="w-3.5 h-3.5" /> Edit
                            </button>
                          )}
                          {onSetDefaultAddress && !address.isDefault && (
                            <button
                              type="button"
                              onClick={(e) => handleSetDefaultClick(e, address)}
                              className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-pink-600 uppercase tracking-wider">
                              <StarIcon className="w-3.5 h-3.5" /> Set default
                            </button>
                          )}
                          {onDeleteAddress && savedAddresses.length > 0 && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteClick(e, address)}
                              className={`flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider ml-auto ${
                                confirmingDelete
                                  ? "text-red-600"
                                  : "text-gray-500 hover:text-red-500"
                              }`}>
                              <TrashIcon className="w-3.5 h-3.5" />
                              {confirmingDelete
                                ? "Tap again to confirm"
                                : "Delete"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <AddressForm
              form={addressDraft}
              onChange={onAddressChange}
              onSubmit={handleSaveAndClose}
              disabled={isLoading}
              pinLoading={pinLoading}
              pinStatus={pinStatus}
              errors={formErrors}
              onAddNewAddress={
                savedAddresses.length > 0 ? handleAddNewClick : undefined
              }
            />
          )}
        </div>
      </div>
      {/* END SLIDE-OVER */}
    </div>
  );
};

export default CheckoutAddressView;
