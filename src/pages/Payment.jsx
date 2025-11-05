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

  if (!/^[a-zA-Z\s\-.]+$/.test(trimmedName)) {
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
    <div className="min-h-screen bg-base-900">
      {/* Header */}
      <div className="relative border-b border-surface-border bg-gradient-to-b from-surface/60 to-base-900/60 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-lg bg-surface-light border border-surface-border px-4 py-2.5 text-sm font-medium text-text hover:bg-surface-lighter hover:border-cinema-red/50 hover:text-cinema-red transition-all min-h-[44px] mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Booking</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-cinema-red/10 border-2 border-cinema-red/30 flex items-center justify-center">
              <Lock className="w-6 h-6 text-cinema-red" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text">Complete Payment</h1>
              <p className="text-sm text-text-muted">Secure payment processing</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Status */}
            {paymentStatus === PAYMENT_STATUS.PROCESSING && (
              <div className="card bg-cinema-blue/10 border-2 border-cinema-blue/30 flex items-start gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-cinema-blue flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-text mb-1">Processing Payment</h3>
                  <p className="text-sm text-text-muted">Please wait while we process your payment...</p>
                </div>
              </div>
            )}

            {paymentStatus === PAYMENT_STATUS.SUCCESS && (
              <div className="card bg-success/10 border-2 border-success/30 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-success mb-1">Payment Successful!</h3>
                  <p className="text-sm text-success/80">Redirecting to confirmation page...</p>
                </div>
              </div>
            )}

            {paymentStatus === PAYMENT_STATUS.FAILED && (
              <div className="card bg-danger/10 border-2 border-danger/30 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-danger mb-1">Payment Failed</h3>
                  <p className="text-sm text-danger/80 mb-3">Your payment could not be processed. Please try again.</p>
                  <button onClick={handleRetry} className="btn-secondary text-sm">
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Payment Method Selection */}
            {paymentStatus === PAYMENT_STATUS.PENDING && (
              <>
                <div className="card">
                  <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-cinema-red" />
                    Payment Method
                  </h2>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 rounded-lg border-2 border-cinema-red bg-cinema-red/5 cursor-pointer transition-all">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-cinema-red focus:ring-cinema-red w-5 h-5"
                      />
                      <CreditCard className="w-5 h-5 text-cinema-red" />
                      <span className="font-semibold text-text">Credit/Debit Card</span>
                    </label>
                  </div>
                </div>

                {/* Card Payment Form */}
                {paymentMethod === "card" && (
                  <div className="card">
                    <h3 className="text-xl font-bold text-text mb-6">Card Details</h3>

                    <div className="space-y-5">
                      <div>
                        <label
                          htmlFor="cardNumber"
                          className="block text-sm font-semibold text-text mb-2"
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
          <div className="card-glass lg:sticky lg:top-4 shadow-xl">
            <h3 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-cinema-red" />
              Order Summary
            </h3>

            {/* Movie Info */}
            <div className="flex gap-4 mb-6 pb-6 border-b border-surface-border">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={
                    bookingData.movie?.title ||
                    bookingData.movieId?.title ||
                    "Movie"
                  }
                  className="w-20 h-30 object-cover rounded-lg border-2 border-cinema-red/20 shadow-lg"
                  onError={(e) => {
                    e.target.src = "/placeholder-movie-poster.jpg";
                  }}
                />
              ) : (
                <div className="w-20 h-30 bg-surface-light rounded-lg border border-surface-border flex items-center justify-center">
                  <Film className="h-6 w-6 text-text-dim" />
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-text mb-3 line-clamp-2">
                  {bookingData.movie?.title ||
                    bookingData.movieId?.title ||
                    "Movie"}
                </h4>
                <div className="space-y-2 text-sm text-text-muted">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-cinema-blue" />
                    <span>
                      {new Date(bookingData.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-cinema-blue" />
                    <span>
                      {bookingData.showtime?.time || bookingData.showtime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-cinema-blue" />
                    <span className="line-clamp-1">
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
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-text-muted font-medium">
                  Tickets ({bookingData.seats.length})
                </span>
                <span className="text-text font-medium">
                  {THEATER_CONFIG.currencySymbol}
                  {(bookingData.total || bookingData.totalAmount || 0).toFixed(
                    2,
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted font-medium">Booking Fee</span>
                <span className="text-text font-medium">
                  {THEATER_CONFIG.currencySymbol}0.00
                </span>
              </div>
              <div className="divider my-4"></div>
              <div className="flex justify-between items-center p-4 rounded-lg bg-gradient-to-r from-cinema-red/10 to-cinema-gold/10 border border-cinema-red/20">
                <span className="text-text font-bold text-lg">Total</span>
                <span className="text-cinema-gold font-bold text-2xl">
                  {THEATER_CONFIG.currencySymbol}
                  {(bookingData.total || bookingData.totalAmount || 0).toFixed(
                    2,
                  )}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {paymentStatus === PAYMENT_STATUS.PENDING && (
                <button
                  onClick={processPayment}
                  disabled={isProcessing}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 py-4 text-base"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
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
                <button onClick={handleRetry} className="w-full btn-primary py-4 text-base">
                  Try Again
                </button>
              )}
            </div>

            <p className="text-xs text-text-dim mt-4 text-center leading-relaxed">
              🔒 Secure payment. By clicking "Pay", you agree to our terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
