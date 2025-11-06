import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
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
import { useAuth } from "../contexts/AuthContext";

// Razorpay key from environment variable
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

// Check if using test mode
const isTestMode = RAZORPAY_KEY_ID.includes('test') || RAZORPAY_KEY_ID === import.meta.env.VITE_RAZORPAY_KEY_ID;

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// ============================================================================
// PAYMENT COMPONENT
// ============================================================================

const Payment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookingData, setBookingData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(PAYMENT_STATUS.PENDING);
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [lockExpired, setLockExpired] = useState(false);

  // Calculate time remaining for seat lock
  useEffect(() => {
    if (!bookingData?.lockedUntil) return;

    const updateTimer = () => {
      const now = new Date();
      const lockedUntil = new Date(bookingData.lockedUntil);
      const diff = lockedUntil - now;

      if (diff <= 0) {
        setLockExpired(true);
        setTimeRemaining(null);
        // Redirect back to booking after a short delay
        setTimeout(() => {
          toast.error('Your seat reservation has expired. Please select your seats again.');
          navigate(`/booking/${bookingData.movie?.id || bookingData.movie?._id}`);
        }, 2000);
      } else {
        setTimeRemaining(diff);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [bookingData, navigate]);

  // Format time remaining for display
  const formatTimeRemaining = (ms) => {
    if (!ms) return '0:00';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get time color based on remaining time
  const getTimeColor = (ms) => {
    if (!ms) return 'text-danger';
    const minutes = Math.floor(ms / 60000);
    if (minutes <= 2) return 'text-danger';
    if (minutes <= 5) return 'text-warning';
    return 'text-cinema-blue';
  };

  // Load Razorpay script on mount
  useEffect(() => {
    const loadScript = async () => {
      const loaded = await loadRazorpayScript();
      setRazorpayLoaded(loaded);
      if (!loaded) {
        toast.error('Failed to load payment system. Please refresh the page.');
      }
    };
    loadScript();
  }, []);

  // Load booking data from localStorage
  useEffect(() => {
    const storedBooking = localStorage.getItem("currentBooking");
    if (storedBooking) {
      setBookingData(JSON.parse(storedBooking));
    } else {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // Process Razorpay payment
  const processPayment = async () => {
    if (!razorpayLoaded) {
      toast.error('Payment system not loaded. Please refresh the page.');
      return;
    }

    if (!user) {
      toast.error('Please login to continue with payment');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus(PAYMENT_STATUS.PROCESSING);

    try {
      const totalAmount = (bookingData.total || bookingData.totalAmount || 0) + (THEATER_CONFIG.bookingFee * bookingData.seats.length);
      const amount = Math.round(totalAmount * 100); // Amount in paise

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: amount,
        currency: 'INR',
        name: 'Studio 9',
        description: `${bookingData.movie?.title || 'Movie'} - ${bookingData.seats.length} seat(s)`,
        image: '/vite.svg',
        order_id: '', // Will be generated from backend in production
        handler: async function (response) {
          console.log('Payment successful:', response);

          // Payment successful
          const transactionId = response.razorpay_payment_id;

          try {
            // Confirm booking with backend
            if (bookingData.bookingId) {
              const confirmedBooking = await confirmBooking(bookingData.bookingId, transactionId);
              console.log('✅ Booking confirmed:', confirmedBooking);
            }

            setPaymentStatus(PAYMENT_STATUS.SUCCESS);

            // Store successful booking
            const completedBooking = {
              ...bookingData,
              paymentStatus: PAYMENT_STATUS.SUCCESS,
              transactionId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              completedAt: new Date().toISOString(),
            };

            const existingBookings = JSON.parse(localStorage.getItem("bookingHistory") || "[]");
            existingBookings.push(completedBooking);
            localStorage.setItem("bookingHistory", JSON.stringify(existingBookings));
            localStorage.removeItem("currentBooking");

            setTimeout(() => {
              navigate("/confirmation", { state: { booking: completedBooking } });
            }, 1500);
          } catch (error) {
            console.error('Failed to confirm booking:', error);
            setPaymentStatus(PAYMENT_STATUS.FAILED);
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user.name || '',
          email: user.email || '',
          contact: user.phone || ''
        },
        notes: {
          booking_id: bookingData.bookingId || '',
          movie: bookingData.movie?.title || '',
          seats: Array.isArray(bookingData.seats)
            ? bookingData.seats.map(s => typeof s === 'string' ? s : s.seatId).join(', ')
            : '',
          date: bookingData.date,
          showtime: bookingData.showtime?.time || bookingData.showtime,
          theater: 'Studio 9'
        },
        theme: {
          color: '#dc2626' // cinema-red - this colors the Razorpay modal buttons and branding
        },
        modal: {
          ondismiss: function() {
            console.log('Payment cancelled by user');
            setPaymentStatus(PAYMENT_STATUS.PENDING);
            setIsProcessing(false);
          },
          confirm_close: true, // Ask confirmation before closing
          escape: true, // Allow escape key to close
          animation: true, // Enable smooth animations
          backdropclose: false // Don't close on backdrop click
        }
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        setPaymentStatus(PAYMENT_STATUS.FAILED);
        setIsProcessing(false);
        toast.error(`Payment failed: ${response.error.description}`);
      });

      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus(PAYMENT_STATUS.FAILED);
      setIsProcessing(false);
      toast.error('Payment initiation failed. Please try again.');
    }
  };


  // Go back to booking
  const handleBack = () => {
    if (bookingData?.movie) {
      const movieId = bookingData.movie.id || bookingData.movie._id;
      if (movieId) {
        navigate(`/booking/${movieId}`);
      } else {
        navigate(-1);
      }
    } else {
      navigate("/");
    }
  };

  // Retry payment
  const handleRetry = () => {
    setPaymentStatus(PAYMENT_STATUS.PENDING);
    setIsProcessing(false);
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

  // Debug: Log booking data to see what we have
  console.log('📋 Payment - Booking Data:', bookingData);
  console.log('🎬 Payment - Movie Data:', bookingData.movie);

  const posterUrl = bookingData.movie?.posterUrl || // Backend full URL
    (bookingData.movie?.poster_path
      ? getImageUrl(bookingData.movie.poster_path, "poster", "small")
      : null) ||
    (bookingData.movie?.posterPath
      ? getImageUrl(bookingData.movie.posterPath, "poster", "small")
      : null);

  console.log('🖼️ Payment - Poster URL:', posterUrl);

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

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-cinema-red/10 border-2 border-cinema-red/30 flex items-center justify-center">
                <Lock className="w-6 h-6 text-cinema-red" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-text">Complete Payment</h1>
                <p className="text-sm text-text-muted">Secure payment processing</p>
              </div>
            </div>

            {/* Timer Display */}
            {timeRemaining && !lockExpired && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-light border border-surface-border">
                <Clock className={`w-5 h-5 ${getTimeColor(timeRemaining)}`} />
                <div className="text-right">
                  <p className="text-xs text-text-muted">Time Left</p>
                  <p className={`text-lg font-bold ${getTimeColor(timeRemaining)}`}>
                    {formatTimeRemaining(timeRemaining)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Payment Details */}
          <div className="lg:col-span-8 space-y-6">
            {/* Timer Warning */}
            {timeRemaining && timeRemaining <= 300000 && !lockExpired && (
              <div className={`border-l-4 p-4 ${
                timeRemaining <= 120000 
                  ? 'bg-danger/5 border-danger' 
                  : 'bg-warning/5 border-warning'
              }`}>
                <div className="flex items-start gap-3">
                  <Clock className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    timeRemaining <= 120000 ? 'text-danger' : 'text-warning'
                  }`} />
                  <div>
                    <h3 className={`font-semibold mb-1 text-sm ${
                      timeRemaining <= 120000 ? 'text-danger' : 'text-warning'
                    }`}>
                      {timeRemaining <= 120000 ? 'Time is running out' : 'Complete payment soon'}
                    </h3>
                    <p className="text-xs text-text-muted">
                      Your seats will be released in {formatTimeRemaining(timeRemaining)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Lock Expired Message */}
            {lockExpired && (
              <div className="border-l-4 border-danger bg-danger/5 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-danger mb-1 text-sm">Seat Reservation Expired</h3>
                    <p className="text-xs text-danger/80">Your selected seats have been released. Please select your seats again.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Status Messages */}
            {paymentStatus === PAYMENT_STATUS.PROCESSING && (
              <div className="border-l-4 border-cinema-blue bg-cinema-blue/5 p-4">
                <div className="flex items-start gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-cinema-blue flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-text mb-1 text-sm">Processing Payment</h3>
                    <p className="text-xs text-text-muted">Please wait while we process your payment...</p>
                  </div>
                </div>
              </div>
            )}

            {paymentStatus === PAYMENT_STATUS.SUCCESS && (
              <div className="border-l-4 border-success bg-success/5 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-success mb-1 text-sm">Payment Successful</h3>
                    <p className="text-xs text-success/80">Redirecting to confirmation page...</p>
                  </div>
                </div>
              </div>
            )}

            {paymentStatus === PAYMENT_STATUS.FAILED && (
              <div className="border-l-4 border-danger bg-danger/5 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-danger mb-1 text-sm">Payment Failed</h3>
                    <p className="text-xs text-danger/80 mb-3">Your payment could not be processed. Please try again.</p>
                    <button onClick={handleRetry} className="btn-secondary text-xs">
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method */}
            {paymentStatus === PAYMENT_STATUS.PENDING && (
              <div>
                <h2 className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-cinema-red" />
                  Payment Method
                </h2>

                <div className="border border-surface-border rounded p-4 bg-surface/30">
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-cinema-red mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-text text-sm mb-2">Razorpay Payment Gateway</p>
                      <div className="text-xs text-text-muted space-y-1">
                        <p>• Credit & Debit Cards</p>
                        <p>• UPI (Google Pay, PhonePe, Paytm)</p>
                        <p>• Net Banking</p>
                        <p>• Digital Wallets</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="mt-4 flex items-start gap-3 p-3 bg-cinema-blue/5 rounded">
                  <Lock className="w-4 h-4 text-cinema-blue mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-text-muted">
                    All transactions are encrypted and processed securely through Razorpay. We never store your payment information.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-4">
              <h3 className="text-xs uppercase tracking-wider text-text-dim mb-4">Booking Summary</h3>

              {/* Movie Info */}
              <div className="flex gap-4 pb-6 border-b border-surface-border/50">
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={bookingData.movie?.title || bookingData.movieId?.title || "Movie"}
                    className="w-16 h-24 object-cover rounded"
                    onError={(e) => {
                      e.target.src = "/placeholder-movie-poster.jpg";
                    }}
                  />
                ) : (
                  <div className="w-16 h-24 bg-surface-light rounded flex items-center justify-center">
                    <Film className="h-6 w-6 text-text-dim" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-text mb-3 line-clamp-2 text-sm">
                    {bookingData.movie?.title || bookingData.movieId?.title || "Movie"}
                  </h4>
                  <div className="space-y-2 text-xs text-text-muted">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-cinema-blue" />
                      <span>
                        {new Date(bookingData.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-cinema-blue" />
                      <span>{bookingData.showtime?.time || bookingData.showtime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-cinema-blue" />
                      <span className="line-clamp-1">
                        {Array.isArray(bookingData.seats)
                          ? bookingData.seats.map((s) => (typeof s === "string" ? s : s.seatId)).join(", ")
                          : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="py-6 border-b border-surface-border/50">
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Tickets ({bookingData.seats.length})</span>
                    <span className="text-text">
                      {THEATER_CONFIG.currencySymbol}
                      {(bookingData.total || bookingData.totalAmount || 0).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Booking Fee</span>
                    <span className="text-text">
                      {THEATER_CONFIG.currencySymbol}
                      {(THEATER_CONFIG.bookingFee * bookingData.seats.length).toFixed(0)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline pt-3 border-t border-surface-border/50">
                  <span className="text-text font-semibold">Total Amount</span>
                  <span className="text-text text-2xl font-semibold">
                    {THEATER_CONFIG.currencySymbol}
                    {((bookingData.total || bookingData.totalAmount || 0) + (THEATER_CONFIG.bookingFee * bookingData.seats.length)).toFixed(0)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6">
                {paymentStatus === PAYMENT_STATUS.PENDING && (
                  <button
                    onClick={processPayment}
                    disabled={isProcessing || !razorpayLoaded || lockExpired}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                          {((bookingData.total || bookingData.totalAmount || 0) + (THEATER_CONFIG.bookingFee * bookingData.seats.length)).toFixed(0)}
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

                <p className="text-xs text-text-dim mt-4 text-center leading-relaxed">
                  Secure payment. By clicking "Pay", you agree to our terms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
