import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Lock,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  Users,
} from "lucide-react";
import { getImageUrl } from "../utils/api";
import { confirmBooking } from "../utils/backendApi";
import { THEATER_CONFIG, PAYMENT_STATUS } from "../utils/constants";

const Payment = () => {
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });
  const [paymentStatus, setPaymentStatus] = useState(PAYMENT_STATUS.PENDING);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Load booking data from localStorage
  useEffect(() => {
    const storedBooking = localStorage.getItem("currentBooking");
    if (storedBooking) {
      setBookingData(JSON.parse(storedBooking));
    } else {
      // Redirect if no booking data
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number
    if (name === "cardNumber") {
      formattedValue = value
        .replace(/\s/g, "")
        .replace(/(.{4})/g, "$1 ")
        .trim();
      if (formattedValue.length > 19) return; // Max 16 digits + 3 spaces
    }

    // Format expiry date
    if (name === "expiryDate") {
      formattedValue = value.replace(/\D/g, "").replace(/(.{2})/, "$1/");
      if (formattedValue.length > 5) return; // MM/YY
    }

    // Format CVV
    if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "");
      if (formattedValue.length > 3) return; // Max 3 digits
    }

    setPaymentForm((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate payment form
  const validateForm = () => {
    const errors = {};

    if (paymentMethod === "card") {
      // Card number validation
      const cardNumber = paymentForm.cardNumber.replace(/\s/g, "");
      if (!cardNumber) {
        errors.cardNumber = "Card number is required";
      } else if (cardNumber.length < 16) {
        errors.cardNumber = "Card number must be 16 digits";
      }

      // Expiry date validation
      if (!paymentForm.expiryDate) {
        errors.expiryDate = "Expiry date is required";
      } else if (!/^\d{2}\/\d{2}$/.test(paymentForm.expiryDate)) {
        errors.expiryDate = "Enter valid expiry date (MM/YY)";
      }

      // CVV validation
      if (!paymentForm.cvv) {
        errors.cvv = "CVV is required";
      } else if (paymentForm.cvv.length !== 3) {
        errors.cvv = "CVV must be 3 digits";
      }

      // Cardholder name validation
      if (!paymentForm.cardholderName.trim()) {
        errors.cardholderName = "Cardholder name is required";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Simulate payment processing
  const processPayment = async () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    setPaymentStatus(PAYMENT_STATUS.PROCESSING);

    try {
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate random success/failure (90% success rate for demo)
      const isSuccess = Math.random() > 0.1;

      if (isSuccess) {
        const transactionId = `TXN${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

        // If booking has backend ID, confirm with backend
        if (bookingData.bookingId && bookingData.bookingId.startsWith("BK")) {
          try {
            console.log(
              "Confirming booking with backend:",
              bookingData.bookingId,
            );
            await confirmBooking(bookingData.bookingId, transactionId);
            console.log(" Booking confirmed with backend");
          } catch (error) {
            console.error("Failed to confirm booking with backend:", error);
            // Continue anyway for demo purposes
          }
        }

        setPaymentStatus(PAYMENT_STATUS.SUCCESS);

        // Store successful booking
        const completedBooking = {
          ...bookingData,
          paymentStatus: PAYMENT_STATUS.SUCCESS,
          transactionId,
          completedAt: new Date().toISOString(),
        };

        // Add to booking history
        const existingBookings = JSON.parse(
          localStorage.getItem("bookingHistory") || "[]",
        );
        existingBookings.push(completedBooking);
        localStorage.setItem(
          "bookingHistory",
          JSON.stringify(existingBookings),
        );

        // Clear current booking
        localStorage.removeItem("currentBooking");

        // Redirect to confirmation after 2 seconds
        setTimeout(() => {
          navigate("/confirmation", {
            state: { booking: completedBooking },
          });
        }, 2000);
      } else {
        setPaymentStatus(PAYMENT_STATUS.FAILED);
      }
    } catch {
      setPaymentStatus(PAYMENT_STATUS.FAILED);
    } finally {
      setIsProcessing(false);
    }
  };

  // Go back to booking
  const handleBack = () => {
    if (bookingData) {
      navigate(`/booking/${bookingData.movie.id}`);
    } else {
      navigate("/");
    }
  };

  // Retry payment
  const handleRetry = () => {
    setPaymentStatus(PAYMENT_STATUS.PENDING);
    setFormErrors({});
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-900 mx-auto mb-4" />
          <p className="text-primary-600">Loading...</p>
        </div>
      </div>
    );
  }

  const posterUrl = getImageUrl(
    bookingData.movie?.poster_path || bookingData.movie?.posterPath,
    "poster",
    "small",
  );

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <div className="bg-white border-b border-primary-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Booking</span>
          </button>

          <div className="flex items-center space-x-3">
            <Lock className="w-5 h-5 text-green-600" />
            <h1 className="text-2xl font-semibold text-primary-900">
              Secure Payment
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="space-y-6">
            {/* Payment Status */}
            {paymentStatus === PAYMENT_STATUS.PROCESSING && (
              <div className="bg-blue-50 border border-blue-200 p-4 flex items-center space-x-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-900">
                    Processing Payment
                  </h3>
                  <p className="text-sm text-blue-700">
                    Please wait while we process your payment...
                  </p>
                </div>
              </div>
            )}

            {paymentStatus === PAYMENT_STATUS.SUCCESS && (
              <div className="bg-green-50 border border-green-200 p-4 flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <h3 className="font-medium text-green-900">
                    Payment Successful!
                  </h3>
                  <p className="text-sm text-green-700">
                    Redirecting to confirmation page...
                  </p>
                </div>
              </div>
            )}

            {paymentStatus === PAYMENT_STATUS.FAILED && (
              <div className="bg-red-50 border border-red-200 p-4 flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <h3 className="font-medium text-red-900">Payment Failed</h3>
                  <p className="text-sm text-red-700">
                    Your payment could not be processed. Please try again.
                  </p>
                </div>
              </div>
            )}

            {/* Payment Method Selection */}
            {paymentStatus === PAYMENT_STATUS.PENDING && (
              <>
                <div className="bg-white border border-primary-200 p-6">
                  <h2 className="text-lg font-semibold text-primary-900 mb-4">
                    Payment Method
                  </h2>

                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-primary-900 focus:ring-primary-900"
                      />
                      <CreditCard className="w-5 h-5 text-primary-600" />
                      <span className="font-medium text-primary-900">
                        Credit/Debit Card
                      </span>
                    </label>
                  </div>
                </div>

                {/* Card Payment Form */}
                {paymentMethod === "card" && (
                  <div className="bg-white border border-primary-200 p-6">
                    <h3 className="text-lg font-semibold text-primary-900 mb-4">
                      Card Details
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="cardNumber"
                          className="block text-sm font-medium text-primary-700 mb-2"
                        >
                          Card Number
                        </label>
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          value={paymentForm.cardNumber}
                          onChange={handleInputChange}
                          placeholder="1234 5678 9012 3456"
                          className={`input-field ${formErrors.cardNumber ? "border-red-500" : ""}`}
                        />
                        {formErrors.cardNumber && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.cardNumber}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="expiryDate"
                            className="block text-sm font-medium text-primary-700 mb-2"
                          >
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            id="expiryDate"
                            name="expiryDate"
                            value={paymentForm.expiryDate}
                            onChange={handleInputChange}
                            placeholder="MM/YY"
                            className={`input-field ${formErrors.expiryDate ? "border-red-500" : ""}`}
                          />
                          {formErrors.expiryDate && (
                            <p className="mt-1 text-sm text-red-600">
                              {formErrors.expiryDate}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="cvv"
                            className="block text-sm font-medium text-primary-700 mb-2"
                          >
                            CVV
                          </label>
                          <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            value={paymentForm.cvv}
                            onChange={handleInputChange}
                            placeholder="123"
                            className={`input-field ${formErrors.cvv ? "border-red-500" : ""}`}
                          />
                          {formErrors.cvv && (
                            <p className="mt-1 text-sm text-red-600">
                              {formErrors.cvv}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="cardholderName"
                          className="block text-sm font-medium text-primary-700 mb-2"
                        >
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          id="cardholderName"
                          name="cardholderName"
                          value={paymentForm.cardholderName}
                          onChange={handleInputChange}
                          placeholder="John Doe"
                          className={`input-field ${formErrors.cardholderName ? "border-red-500" : ""}`}
                        />
                        {formErrors.cardholderName && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.cardholderName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Notice */}
                <div className="bg-primary-50 border border-primary-200 p-4 flex items-start space-x-3">
                  <Lock className="w-5 h-5 text-primary-600 mt-0.5" />
                  <div className="text-sm text-primary-700">
                    <p className="font-medium mb-1">Your payment is secure</p>
                    <p>
                      All transactions are encrypted and processed securely. We
                      never store your payment information.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Booking Summary */}
          <div className="bg-white border border-primary-200 p-6 h-fit sticky top-4">
            <h3 className="text-lg font-semibold text-primary-900 mb-4">
              Order Summary
            </h3>

            {/* Movie Info */}
            <div className="flex space-x-4 mb-6">
              <img
                src={posterUrl}
                alt={bookingData.movie.title}
                className="w-16 h-24 object-cover border border-primary-200"
                onError={(e) => {
                  e.target.src = "/placeholder-movie-poster.jpg";
                }}
              />
              <div className="flex-1">
                <h4 className="font-medium text-primary-900 mb-2">
                  {bookingData.movie.title}
                </h4>
                <div className="space-y-1 text-sm text-primary-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(bookingData.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {bookingData.showtime?.time || bookingData.showtime}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>Seats: {bookingData.seats.join(", ")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 text-sm border-t border-primary-200 pt-4">
              <div className="flex justify-between">
                <span className="text-primary-600">
                  Tickets ({bookingData.seats.length})
                </span>
                <span className="text-primary-900">
                  {THEATER_CONFIG.currencySymbol}
                  {bookingData.total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-600">Booking Fee</span>
                <span className="text-primary-900">
                  {THEATER_CONFIG.currencySymbol}0.00
                </span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t border-primary-200 pt-3">
                <span className="text-primary-900">Total</span>
                <span className="text-primary-900">
                  {THEATER_CONFIG.currencySymbol}
                  {bookingData.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              {paymentStatus === PAYMENT_STATUS.PENDING && (
                <button
                  onClick={processPayment}
                  disabled={isProcessing}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>
                        Pay {THEATER_CONFIG.currencySymbol}
                        {bookingData.total.toFixed(2)}
                      </span>
                    </>
                  )}
                </button>
              )}

              {paymentStatus === PAYMENT_STATUS.FAILED && (
                <button onClick={handleRetry} className="w-full btn-primary">
                  Try Again
                </button>
              )}
            </div>

            <p className="text-xs text-primary-500 mt-4 text-center">
              By clicking "Pay", you agree to our terms of service and privacy
              policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
