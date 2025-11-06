import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Users,
  Download,
  Share2,
  Home,
  Film, Ticket, CreditCard,  AlertCircle
} from "lucide-react";
import { getImageUrl } from "../utils/api";
import { THEATER_CONFIG } from "../utils/constants";

const Confirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    // Get booking data from navigation state or localStorage
    const bookingData =
      location.state?.booking ||
      JSON.parse(localStorage.getItem("bookingHistory") || "[]").slice(-1)[0];

    if (bookingData) {
      setBooking(bookingData);
    } else {
      // Redirect if no booking data
      navigate("/", { replace: true });
    }
  }, [location.state, navigate]);

  const handleDownloadTicket = () => {
    // Create a canvas element to generate ticket image
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, 0, canvas.width, 120);

    // Studio 9 Logo/Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('STUDIO 9', canvas.width / 2, 70);

    // Ticket Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('MOVIE TICKET', canvas.width / 2, 180);

    // Movie Title
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 28px Arial';
    const movieTitle = booking.movie?.title || 'Movie';
    ctx.fillText(movieTitle.toUpperCase(), canvas.width / 2, 240);

    // Details section
    ctx.textAlign = 'left';
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '20px Arial';
    let yPos = 300;

    // Date
    ctx.fillText('DATE:', 80, yPos);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(new Date(booking.date || booking.showtime?.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }), 220, yPos);

    yPos += 50;
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '20px Arial';
    ctx.fillText('TIME:', 80, yPos);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(booking.showtime?.time || '', 220, yPos);

    yPos += 50;
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '20px Arial';
    ctx.fillText('SEATS:', 80, yPos);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    const seats = Array.isArray(booking.seats)
      ? booking.seats.map(s => typeof s === 'string' ? s : s.seatId).join(', ')
      : '';
    ctx.fillText(seats, 220, yPos);

    yPos += 50;
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '20px Arial';
    ctx.fillText('SCREEN:', 80, yPos);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(booking.screenType || booking.screenName || 'Standard', 220, yPos);

    yPos += 50;
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '20px Arial';
    ctx.fillText('BOOKING ID:', 80, yPos);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(booking.bookingId || booking._id || '', 220, yPos);

    // Price section
    yPos += 80;
    ctx.strokeStyle = '#3f3f46';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, yPos);
    ctx.lineTo(750, yPos);
    ctx.stroke();

    yPos += 50;
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '24px Arial';
    ctx.fillText('TOTAL AMOUNT:', 80, yPos);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`₹${(booking.total || booking.totalAmount || 0).toFixed(0)}`, 720, yPos);

    // Footer
    yPos += 80;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#71717a';
    ctx.font = '16px Arial';
    ctx.fillText('Please arrive 15 minutes before showtime', canvas.width / 2, yPos);
    yPos += 30;
    ctx.fillText('Present this ticket at the entrance', canvas.width / 2, yPos);

    // QR Code placeholder (you can integrate a real QR code library)
    yPos += 60;
    ctx.strokeStyle = '#71717a';
    ctx.lineWidth = 2;
    ctx.strokeRect(canvas.width / 2 - 100, yPos, 200, 200);
    ctx.fillStyle = '#71717a';
    ctx.font = '16px Arial';
    ctx.fillText('QR CODE', canvas.width / 2, yPos + 110);

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Studio9-Ticket-${booking.bookingId || Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  };

  const handleShareBooking = () => {
    // Simulate sharing
    if (navigator.share) {
      navigator.share({
        title: "Movie Booking Confirmation",
        text: `I just booked tickets for ${booking.movie.title}!`,
        url: window.location.href,
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Booking link copied to clipboard!");
    }
  };

  const handleBookAnother = () => {
    navigate("/");
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-base-900 grid place-items-center">
        <div className="text-center card">
          <Film className="w-12 h-12 text-text-dim mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text mb-2">
            No booking found
          </h3>
          <p className="text-text-muted mb-4">
            Unable to load booking confirmation.
          </p>
          <button onClick={() => navigate("/")} className="btn-primary">
            Back to Movies
          </button>
        </div>
      </div>
    );
  }

  const posterUrl = booking.movie?.posterUrl || // Backend full URL
    getImageUrl(
      booking.movie?.poster_path || booking.movie?.posterPath,
      "poster",
      "medium",
    );

  return (
    <div className="min-h-screen bg-base-900">
      {/* Clean Header */}
      <div className="border-b border-surface-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-success" />
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-text">Booking Confirmed</h1>
                <p className="text-xs text-text-dim">ID: {booking.bookingId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleDownloadTicket} className="btn-ghost text-xs sm:text-sm">
                <Download className="w-4 h-4" />
              </button>
              <button onClick={handleShareBooking} className="btn-ghost text-xs sm:text-sm">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column - Movie & Details */}
          <div className="lg:col-span-8">
            {/* Movie Section */}
            <div className="flex gap-4 pb-6 border-b border-surface-border/50">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={booking.movie?.title || "Movie"}
                  className="w-20 h-28 sm:w-24 sm:h-36 object-cover rounded"
                  onError={(e) => { e.target.src = "/placeholder-movie-poster.jpg"; }}
                />
              ) : (
                <div className="w-20 h-28 sm:w-24 sm:h-36 bg-surface-light rounded flex items-center justify-center">
                  <Film className="h-6 w-6 text-text-dim" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-text mb-4">
                  {booking.movie?.title || booking.movieId?.title || "Movie"}
                </h2>

                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <p className="text-text-dim text-xs mb-1">Date</p>
                    <p className="text-text font-medium">
                      {new Date(booking.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-dim text-xs mb-1">Time</p>
                    <p className="text-text font-medium">{booking.showtime?.time || booking.showtime}</p>
                  </div>
                  <div>
                    <p className="text-text-dim text-xs mb-1">Cinema</p>
                    <p className="text-text font-medium">Studio 9</p>
                  </div>
                  <div>
                    <p className="text-text-dim text-xs mb-1">Seats</p>
                    <p className="text-text font-medium">
                      {Array.isArray(booking.seats) ? booking.seats.map((s) => (typeof s === "string" ? s : s.seatId)).join(", ") : ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="py-6 border-b border-surface-border/50">
              <h3 className="text-xs uppercase tracking-wider text-text-dim mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-text-dim text-xs mb-1">Name</p>
                  <p className="text-text">{booking.customerInfo.name}</p>
                </div>
                <div>
                  <p className="text-text-dim text-xs mb-1">Email</p>
                  <p className="text-text truncate">{booking.customerInfo.email}</p>
                </div>
                <div>
                  <p className="text-text-dim text-xs mb-1">Phone</p>
                  <p className="text-text">{booking.customerInfo.phone}</p>
                </div>
              </div>
            </div>

            {/* Important Info */}
            <div className="py-6">
              <div className="flex gap-3 text-sm">
                <AlertCircle className="w-4 h-4 text-text-dim flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-text-muted text-xs space-y-1">
                    <span className="block">• Arrive 15 minutes early</span>
                    <span className="block">• Bring valid ID</span>
                    <span className="block">• Mobile tickets accepted</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Summary */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-4">
              <div className="pb-4 border-b border-surface-border/50 mb-4">
                <h3 className="text-xs uppercase tracking-wider text-text-dim mb-4">Payment Summary</h3>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Tickets ({booking.seats.length})</span>
                    <span className="text-text">{THEATER_CONFIG.currencySymbol}{(booking.total || booking.totalAmount || 0).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Fee</span>
                    <span className="text-text">{THEATER_CONFIG.currencySymbol}0</span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline pt-3 border-t border-surface-border/50">
                  <span className="text-text font-semibold">Total Paid</span>
                  <span className="text-text text-2xl font-semibold">
                    {THEATER_CONFIG.currencySymbol}{(booking.total || booking.totalAmount || 0).toFixed(0)}
                  </span>
                </div>
              </div>

              <div className="text-xs text-text-dim mb-4">
                <p className="mb-1">Transaction ID</p>
                <p className="font-mono text-text text-sm">{booking.transactionId}</p>
              </div>

              <div className="space-y-2">
                <button onClick={handleDownloadTicket} className="w-full btn-primary">
                  Download Ticket
                </button>
                <button onClick={handleBookAnother} className="w-full btn-secondary">
                  Book Another
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
