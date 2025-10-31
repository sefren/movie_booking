import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Users,
  Download,
  Share2,
  Home,
  Film
} from 'lucide-react';
import { getImageUrl } from '../utils/api';
import { THEATER_CONFIG } from '../utils/constants';

const Confirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    // Get booking data from navigation state or localStorage
    const bookingData = location.state?.booking ||
      JSON.parse(localStorage.getItem('bookingHistory') || '[]').slice(-1)[0];

    if (bookingData) {
      setBooking(bookingData);
    } else {
      // Redirect if no booking data
      navigate('/', { replace: true });
    }
  }, [location.state, navigate]);

  const handleDownloadTicket = () => {
    // Simulate ticket download
    alert('Ticket download feature will be implemented with PDF generation');
  };

  const handleShareBooking = () => {
    // Simulate sharing
    if (navigator.share) {
      navigator.share({
        title: 'Movie Booking Confirmation',
        text: `I just booked tickets for ${booking.movie.title}!`,
        url: window.location.href
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Booking link copied to clipboard!');
    }
  };

  const handleBookAnother = () => {
    navigate('/');
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Film className="w-12 h-12 text-primary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-primary-900 mb-2">No booking found</h3>
          <p className="text-primary-600 mb-4">Unable to load booking confirmation.</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Back to Movies
          </button>
        </div>
      </div>
    );
  }

  const posterUrl = getImageUrl(booking.movie.poster_path, 'poster', 'medium');

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Success Header */}
      <div className="bg-green-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-green-100 text-lg">
              Your movie tickets have been successfully booked
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Details */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-primary-200 overflow-hidden">
          {/* Booking Header */}
          <div className="bg-primary-50 px-6 py-4 border-b border-primary-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-primary-900">Booking Details</h2>
                <p className="text-primary-600 mt-1">Booking ID: {booking.bookingId}</p>
              </div>
              <div className="mt-3 sm:mt-0">
                <p className="text-sm text-primary-600">Transaction ID</p>
                <p className="font-medium text-primary-900">{booking.transactionId}</p>
              </div>
            </div>
          </div>

          {/* Movie & Booking Info */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Movie Information */}
              <div>
                <div className="flex space-x-4 mb-6">
                  <img
                    src={posterUrl}
                    alt={booking.movie.title}
                    className="w-24 h-36 object-cover border border-primary-200"
                    onError={(e) => {
                      e.target.src = '/placeholder-movie-poster.jpg';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-primary-900 mb-2">
                      {booking.movie.title}
                    </h3>
                    {booking.movie.runtime && (
                      <div className="flex items-center space-x-1 text-primary-600 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{booking.movie.runtime} minutes</span>
                      </div>
                    )}
                    <div className="text-sm text-primary-600">
                      <p>Enjoy your movie experience!</p>
                    </div>
                  </div>
                </div>

                {/* Show Details */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="text-sm text-primary-600">Date</p>
                      <p className="font-medium text-primary-900">
                        {new Date(booking.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="text-sm text-primary-600">Show Time</p>
                      <p className="font-medium text-primary-900">{booking.showtime}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="text-sm text-primary-600">Cinema</p>
                      <p className="font-medium text-primary-900">Cinema Multiplex</p>
                      <p className="text-sm text-primary-600">Theater 1, Screen 1</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="text-sm text-primary-600">Seats</p>
                      <p className="font-medium text-primary-900">
                        {booking.seats.join(', ')} ({booking.seats.length} tickets)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer & Payment Info */}
              <div className="space-y-6">
                {/* Customer Information */}
                <div>
                  <h4 className="text-lg font-semibold text-primary-900 mb-3">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-primary-600">Name: </span>
                      <span className="font-medium text-primary-900">{booking.customerInfo.name}</span>
                    </div>
                    <div>
                      <span className="text-primary-600">Email: </span>
                      <span className="font-medium text-primary-900">{booking.customerInfo.email}</span>
                    </div>
                    <div>
                      <span className="text-primary-600">Phone: </span>
                      <span className="font-medium text-primary-900">{booking.customerInfo.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Summary */}
                <div>
                  <h4 className="text-lg font-semibold text-primary-900 mb-3">Payment Summary</h4>
                  <div className="bg-primary-50 border border-primary-200 p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-primary-600">Tickets ({booking.seats.length})</span>
                      <span className="text-primary-900">
                        {THEATER_CONFIG.currencySymbol}{booking.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary-600">Booking Fee</span>
                      <span className="text-primary-900">{THEATER_CONFIG.currencySymbol}0.00</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t border-primary-200 pt-2">
                      <span className="text-primary-900">Total Paid</span>
                      <span className="text-primary-900">
                        {THEATER_CONFIG.currencySymbol}{booking.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-green-600 mt-2 flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Payment successful
                  </p>
                </div>

                {/* Important Information */}
                <div className="bg-yellow-50 border border-yellow-200 p-4">
                  <h5 className="font-medium text-yellow-900 mb-2">Important Information</h5>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li> Please arrive 15 minutes before show time</li>
                    <li> Bring a valid ID for verification</li>
                    <li> No outside food or drinks allowed</li>
                    <li> Mobile tickets are accepted</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-primary-50 px-6 py-4 border-t border-primary-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownloadTicket}
                className="btn-primary flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Tickets</span>
              </button>

              <button
                onClick={handleShareBooking}
                className="btn-secondary flex items-center justify-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Booking</span>
              </button>

              <button
                onClick={handleBookAnother}
                className="btn-secondary flex items-center justify-center space-x-2 sm:ml-auto"
              >
                <Home className="w-4 h-4" />
                <span>Book Another Movie</span>
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-primary-600">
            A confirmation email has been sent to {booking.customerInfo.email}
          </p>
          <p className="text-sm text-primary-500 mt-2">
            For any queries, please contact customer support or visit the cinema counter.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
