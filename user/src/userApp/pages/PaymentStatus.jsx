import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getPaymentStatus } from "../features/orders/services/payment.service";

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("order_id");

  const [status, setStatus] = useState("loading"); // loading, success, failed
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!orderId) {
      navigate("/");
      return;
    }

    const checkStatus = async () => {
      try {
        const data = await getPaymentStatus(orderId);
        if (data.paymentStatus === "PAID" || data.paymentStatus === "ACTIVE") {
          setStatus("success");
          // Optionally wait a couple of seconds and redirect to a success page or order page
          setTimeout(() => {
             navigate(`/orders/${orderId}`);
          }, 3000);
        } else {
          setStatus("failed");
          setErrorMessage("Payment was not successful. Please try again.");
        }
      } catch (err) {
        console.error("Error fetching payment status:", err);
        setStatus("failed");
        setErrorMessage("Could not verify payment status.");
      }
    };

    checkStatus();
  }, [orderId, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg text-center">
        {status === "loading" && (
          <div>
            <div className="mx-auto h-12 w-12 border-4 border-t-gray-900 border-gray-200 rounded-full animate-spin"></div>
            <h2 className="mt-6 text-2xl font-extrabold text-gray-900">Verifying Payment</h2>
            <p className="mt-2 text-sm text-gray-600">Please do not refresh the page.</p>
          </div>
        )}
        
        {status === "success" && (
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-2xl font-extrabold text-gray-900">Payment Successful!</h2>
            <p className="mt-2 text-sm text-gray-600">Your order #{orderId} has been confirmed. Redirecting...</p>
            <button
              onClick={() => navigate(`/orders/${orderId}`)}
              className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800"
            >
              View Order
            </button>
          </div>
        )}

        {status === "failed" && (
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-6 text-2xl font-extrabold text-gray-900">Payment Failed</h2>
            <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
            <button
              onClick={() => navigate("/cart")}
              className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800"
            >
              Return to Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStatus;
