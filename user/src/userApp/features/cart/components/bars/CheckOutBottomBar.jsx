const CheckOutBottomBar = ({ selectedItems, totalPrice, onPlaceOrder }) => {
  // Show how many items are selected
  const selectedCount = selectedItems.length;
  console.log(selectedItems);

  if (selectedCount === 0) return null; // hide if nothing selected

  return (
    <div className="fixed bottom-0 z-60 mt-6 left-0 w-full bg-white shadow-t px-4 py-3 flex justify-between items-center md:hidden">
      {/* Selected items info */}
      <div className="flex flex-col">
        <span className="text-sm font-medium">
          {selectedCount} item(s) selected
        </span>
        <span className="text-sm font-bold">Total: ₹{totalPrice}</span>
      </div>

      {/* Place Order button */}
      <button
        onClick={onPlaceOrder}
        className="bg-[#FF3F6C] uppercase text-white font-semibold py-1.5 px-4 rounded-lg shadow hover:bg-pink-600 transition">
        Place Order
      </button>
    </div>
  );
};

export default CheckOutBottomBar;
