import { AlertCircle, Loader } from "lucide-react";

const OrderSummary = ({
  cart,
  subtotal,
  deliveryFee,
  total,
  handlePlaceOrder,
  loading,
}) => (
  <div className="bg-white rounded-xl shadow-sm p-6 h-fit sticky top-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

    {/* Cart Items */}
    <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
      {cart.map((item) => (
        <div
          key={item._id}
          className="flex justify-between items-center border-b pb-4">
          <div className="flex-1">
            <p className="font-medium text-gray-900">{item.productId?.name}</p>
            <p className="text-sm text-gray-600">
              {item.unit} × {item.quantity}
            </p>
          </div>
          <p className="font-semibold">
            ₹{item.totalPrice?.toLocaleString("en-IN")}
          </p>
        </div>
      ))}
    </div>

    {/* Price Breakdown */}
    <div className="space-y-3 border-t pt-4">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>₹{subtotal}</span>
      </div>
      <div className="flex justify-between">
        <span>Delivery Fee</span>
        <span>₹{deliveryFee}</span>
      </div>
      <div className="flex justify-between font-bold border-t pt-3">
        <span>Total Amount</span>
        <span className="text-orange-600">₹{total}</span>
      </div>
    </div>

    {/* Minimum Order Notice */}
    {subtotal > 0 && subtotal < 299 && (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
        <p className="text-yellow-700 text-sm flex items-center">
          <AlertCircle className="mr-2" size={16} /> Minimum order value is ₹299
        </p>
      </div>
    )}

    {/* Place Order Button */}
    <button
      onClick={handlePlaceOrder}
      disabled={loading || cart.length === 0 || subtotal < 299}
      className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-400 mt-6 flex items-center justify-center">
      {loading ? (
        <>
          <Loader className="animate-spin mr-2" size={20} /> Processing...
        </>
      ) : (
        `Place Order - ₹${total}`
      )}
    </button>
  </div>
);

export default OrderSummary;
