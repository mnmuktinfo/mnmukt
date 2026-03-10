import { Wallet, CreditCard, AlertCircle } from "lucide-react";

const PaymentMethod = ({ paymentType, setPaymentType, formErrors }) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>

    {formErrors.payment && (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
        <p className="text-yellow-700 text-sm flex items-center">
          <AlertCircle className="mr-2" size={16} /> {formErrors.payment}
        </p>
      </div>
    )}

    <div className="space-y-3">
      <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-orange-500">
        <input
          type="radio"
          name="payment"
          value="cash"
          checked={paymentType === "cash"}
          onChange={() => setPaymentType("cash")}
          className="h-4 w-4 text-orange-600"
        />
        <Wallet className="ml-3 mr-2" size={20} />
        <span className="font-medium">Cash on Delivery</span>
      </label>

      <label className="flex items-center p-4 border rounded-lg cursor-pointer opacity-60">
        <input
          type="radio"
          name="payment"
          disabled
          className="h-4 w-4 text-orange-600"
        />
        <CreditCard className="ml-3 mr-2" size={20} />
        <span className="font-medium">Online Payment (Coming Soon)</span>
      </label>
    </div>
  </div>
);

export default PaymentMethod;
