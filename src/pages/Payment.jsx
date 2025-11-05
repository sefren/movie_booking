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
  Film,
} from "lucide-react";
import { getImageUrl } from "../utils/api";
import { confirmBooking } from "../utils/backendApi";
import { THEATER_CONFIG, PAYMENT_STATUS } from "../utils/constants";

// ============================================================================
// CARD VALIDATION HELPERS
// ============================================================================

/**
 * Validate credit card number using Luhn algorithm
 */
const validateCardNumber = (cardNumber) => {
  const digits = cardNumber.replace(/\s/g, "");

  if (!/^\d{13,19}$/.test(digits)) {
    return { valid: false, message: "Card number must be 13-19 digits" };
  }

  // Luhn algorithm
  let sum = 0;
  let shouldDouble = false;

  // Loop from right to left
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  if (sum % 10 !== 0) {
    return { valid: false, message: "Invalid card number" };
  }

  return { valid: true, message: "" };
};

/**
 * Detect card type from number
 */
const detectCardType = (cardNumber) => {
  const digits = cardNumber.replace(/\s/g, "");

  if (/^4/.test(digits)) return "Visa";
  if (/^5[1-5]/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "American Express";
  if (/^6(?:011|5)/.test(digits)) return "Discover";
  if (/^35/.test(digits)) return "JCB";

  return "Unknown";
};

/**
 * Validate expiry date
 */
const validateExpiryDate = (expiryDate) => {
  if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
    return { valid: false, message: "Enter valid format (MM/YY)" };
  }

  const [month, year] = expiryDate.split("/").map((num) => parseInt(num, 10));

  // Validate month
  if (month < 1 || month > 12) {
    return { valid: false, message: "Invalid month (01-12)" };
  }

  // Validate year (check if card is expired)
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
  const currentMonth = currentDate.getMonth() + 1; // 0-indexed

  if (year < currentYear) {
    return { valid: false, message: "Card has expired" };
  }

  if (year === currentYear && month < currentMonth) {
    return { valid: false, message: "Card has expired" };
  }

  // Check if expiry is too far in future (more than 10 years)
  if (year > currentYear + 10) {
    return { valid: false, message: "Expiry year seems invalid" };
  }

  return { valid: true, message: "" };
};

/**
 * Validate CVV
 */
const validateCVV = (cvv, cardType) => {
  // American Express uses 4-digit CVV, others use 3
  const requiredLength = cardType === "American Express" ? 4 : 3;

  if (!/^\d+$/.test(cvv)) {
    return { valid: false, message: "CVV must contain only digits" };
  }

  if (cvv.length !== requiredLength) {
    return {
      valid: false,
      message: `CVV must be ${requiredLength} digits for ${cardType}`,
    };
  }

  return { valid: true, message: "" };
};

/**
 * Validate cardholder name
 */
const validateCardholderName = (name) => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { valid: false, message: "Cardholder name is required" };
  }

  if (trimmedName.length < 2) {
    return { valid: false, message: "Name must be at least 2 characters" };
  }

  if (!/^[a-zA-Z\s\-\.]+$/.test(trimmedName)) {
    return {
      valid: false,
      message: "Name can only contain letters, spaces, hyphens, and periods",
    };
  }

  return { valid: true, message: "" };
};

// ============================================================================
// PAYMENT COMPONENT
// ============================================================================

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
  const [cardType, setCardType] = useState("Unknown");
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

  // Detect card type as user types
  useEffect(() => {
    if (paymentForm.cardNumber) {
      setCardType(detectCardType(paymentForm.cardNumber));
    } else {
      setCardType("Unknown");
    }
  }, [paymentForm.cardNumber]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number
    if (name === "cardNumber") {
      // Remove all non-digits first
      const digitsOnly = value.replace(/\D/g, "");

      // Limit to 16 digits (most common card length)
      if (digitsOnly.length > 16) return;

      // Format with spaces every 4 digits
      formattedValue = digitsOnly.replace(/(.{4})/g, "$1 ").trim();
    }

    // Format expiry date
    if (name === "expiryDate") {
      formattedValue = value.replace(/\D/g, "");
      if (formattedValue.length >= 2) {
        formattedValue =
          formattedValue.substring(0, 2) + "/" + formattedValue.substring(2, 4);
      }
      if (formattedValue.length > 5) return; // MM/YY
    }

    // Format CVV (3 or 4 digits depending on card type)
    if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "");
      const maxLength = cardType === "American Express" ? 4 : 3;
      if (formattedValue.length > maxLength) return;
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
      const cardValidation = validateCardNumber(paymentForm.cardNumber);
      if (!cardValidation.valid) {
        errors.cardNumber = cardValidation.message;
      }

      // Expiry date validation
      const expiryValidation = validateExpiryDate(paymentForm.expiryDate);
      if (!expiryValidation.valid) {
        errors.expiryDate = expiryValidation.message;
      }

      // CVV validation
      const cvvValidation = validateCVV(paymentForm.cvv, cardType);
      if (!cvvValidation.valid) {
        errors.cvv = cvvValidation.message;
      }

      // Cardholder name validation
      const nameValidation = validateCardholderName(paymentForm.cardholderName);
      if (!nameValidation.valid) {
        errors.cardholderName = nameValidation.message;
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
        if (bookingData.bookingId) {
          try {
            console.log(
              "💳 Confirming booking with backend:",
              bookingData.bookingId,
              "Transaction:",
              transactionId
            );
            const confirmedBooking = await confirmBooking(bookingData.bookingId, transactionId);
            console.log("✅ Booking confirmed with backend:", confirmedBooking);
          } catch (error) {
            console.error("❌ Failed to confirm booking with backend:", error);
            // Continue anyway for demo purposes
          }
        } else {
          console.warn("⚠️  No bookingId found, skipping backend confirmation");
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
                        <div className="relative">
                          <input
                            type="text"
                            id="cardNumber"
                            name="cardNumber"
                            value={paymentForm.cardNumber}
                            onChange={handleInputChange}
                            placeholder="1234 5678 9012 3456"
                            className={`input-field pr-20 ${formErrors.cardNumber ? "border-red-500" : ""}`}
                          />
                          {cardType !== "Unknown" && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
                              {cardType}
                            </div>
                          )}
                        </div>
                        {formErrors.cardNumber && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.cardNumber}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-primary-500">
                          Test cards: 4532015112830366 (Visa) or
                          5425233430109903 (Mastercard)
                        </p>
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
                            placeholder={
                              cardType === "American Express" ? "1234" : "123"
                            }
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
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={
                    bookingData.movie?.title ||
                    bookingData.movieId?.title ||
                    "Movie"
                  }
                  className="w-16 h-24 object-cover border border-primary-200"
                  onError={(e) => {
                    e.target.src = "/placeholder-movie-poster.jpg";
                  }}
                />
              ) : (
                <div className="w-16 h-24 bg-primary-100 flex items-center justify-center border border-primary-200">
                  <Film className="h-6 w-6 text-primary-400" />
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-medium text-primary-900 mb-2">
                  {bookingData.movie?.title ||
                    bookingData.movieId?.title ||
                    "Movie"}
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
                    <span>
                      Seats:{" "}
                      {Array.isArray(bookingData.seats)
                        ? bookingData.seats
                            .map((s) => (typeof s === "string" ? s : s.seatId))
                            .join(", ")
                        : ""}
                    </span>
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
                  {(bookingData.total || bookingData.totalAmount || 0).toFixed(
                    2,
                  )}
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
                  {(bookingData.total || bookingData.totalAmount || 0).toFixed(
                    2,
                  )}
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
                        {(
                          bookingData.total ||
                          bookingData.totalAmount ||
                          0
                        ).toFixed(2)}
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
