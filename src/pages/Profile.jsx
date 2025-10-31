import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Loader2,
  AlertCircle,
  Edit,
  Save,
  X,
  CreditCard,
  Download,
  Eye,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getUserBookings, updateUserProfile } from "../utils/authApi";
import { getImageUrl } from "../utils/api";
</parameter>

const Profile = () => {
  const { user, isAuthenticated, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update timer every second for pending bookings
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
      return;
    }

    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await getUserBookings();
        setBookings(data || []);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [isAuthenticated, navigate]);

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async () => {
    setUpdateLoading(true);
    try {
      const updatedUser = await updateUserProfile(editForm);
      updateUser(updatedUser);
      setIsEditing(false);
    } catch (err) {
      alert(err.message || "Failed to update profile");
    } finally {
      setUpdateLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTimeRemaining = (lockedUntil) => {
    if (!lockedUntil) return null;
    const expiry = new Date(lockedUntil);
    const diff = expiry - currentTime;

    if (diff <= 0) return "Expired";

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleCompletePayment = (booking) => {
    // Store booking data and navigate to payment
    localStorage.setItem("currentBooking", JSON.stringify(booking));
    navigate("/payment");
  };

  const handleViewTicket = (booking) => {
    navigate("/confirmation", { state: { booking } });
  };

  const handleRetry = (booking) => {
    // Navigate back to booking page with pre-selected seats
    navigate(`/movie/${booking.movieId._id || booking.movieId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-900 mx-auto mb-4" />
          <p className="text-primary-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white border border-primary-200 p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <h1 className="text-3xl font-bold text-primary-900">My Profile</h1>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-900"
              >
                <Edit className="w-4 h-4" />
                <span className="text-sm">Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleUpdateProfile}
                  disabled={updateLoading}
                  className="flex items-center space-x-2 text-green-600 hover:text-green-800 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span className="text-sm">Save</span>
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({ name: user?.name || "", phone: user?.phone || "" });
                  }}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                  <span className="text-sm">Cancel</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-primary-600" />
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    className="flex-1 px-3 py-2 border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-900"
                    placeholder="Your name"
                  />
                ) : (
                  <div>
                    <p className="text-sm text-primary-600">Name</p>
                    <p className="font-medium text-primary-900">{user?.name}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-sm text-primary-600">Email</p>
                  <p className="font-medium text-primary-900">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-600" />
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditChange}
                    pattern="[0-9]{10,15}"
                    className="flex-1 px-3 py-2 border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-900"
                    placeholder="Your phone"
                  />
                ) : (
                  <div>
                    <p className="text-sm text-primary-600">Phone</p>
                    <p className="font-medium text-primary-900">{user?.phone}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <Ticket className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-sm text-primary-600">Total Bookings</p>
                  <p className="font-medium text-primary-900">{bookings.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="bg-white border border-primary-200 p-6">
          <h2 className="text-2xl font-bold text-primary-900 mb-6">My Bookings</h2>

          {error ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-primary-900 mb-2">
                Failed to load bookings
              </h3>
              <p className="text-primary-600">{error}</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="mx-auto h-12 w-12 text-primary-400 mb-4" />
              <h3 className="text-lg font-medium text-primary-900 mb-2">
                No bookings yet
              </h3>
              <p className="text-primary-600 mb-6">
                Start booking your favorite movies now!
              </p>
              <button
                onClick={() => navigate("/")}
                className="btn-primary"
              >
                Browse Movies
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const timeRemaining = booking.status === "pending" ? getTimeRemaining(booking.lockedUntil) : null;
                const isExpired = timeRemaining === "Expired";

                return (
                  <div
                    key={booking._id}
                    className="border border-primary-200 p-4 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Movie Poster */}
                      <div className="flex-shrink-0">
                        <div className="w-24 h-36 bg-primary-100">
                          {booking.movieId?.posterPath ? (
                            <img
                              src={getImageUrl(
                                booking.movieId.posterPath,
                                "poster",
                                "small"
                              )}
                              alt={booking.movieId?.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Ticket className="h-8 w-8 text-primary-400" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-primary-900">
                              {booking.movieId?.title || "Movie"}
                            </h3>
                            <p className="text-sm text-primary-600">
                              Booking ID: {booking.bookingId}
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`inline-block px-3 py-1 text-xs font-medium border ${getStatusColor(
                                booking.status
                              )}`}
                            >
                              {booking.status?.toUpperCase()}
                            </span>
                            {booking.status === "pending" && timeRemaining && !isExpired && (
                              <p className="text-xs text-yellow-600 mt-1">
                                Expires in: {timeRemaining}
                              </p>
                            )}
                            {isExpired && (
                              <p className="text-xs text-red-600 mt-1">
                                Payment expired
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center space-x-2 text-primary-600">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(booking.showtime?.date)}</span>
                          </div>

                          <div className="flex items-center space-x-2 text-primary-600">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(booking.showtime?.time)}</span>
                          </div>

                          <div className="flex items-center space-x-2 text-primary-600">
                            <MapPin className="w-4 h-4" />
                            <span>
                              {booking.screenId?.name} ({booking.screenId?.screenType})
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 text-primary-600">
                            <Ticket className="w-4 h-4" />
                            <span>
                              Seats: {booking.seats?.map((s) => s.seatId).join(", ")}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-primary-100">
                          <span className="text-sm text-primary-600">Total Amount:</span>
                          <span className="text-lg font-bold text-primary-900">
                            ${booking.totalAmount?.toFixed(2)}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          {booking.status === "confirmed" && (
                            <>
                              <button
                                onClick={() => handleViewTicket(booking)}
                                className="flex items-center space-x-2 px-4 py-2 bg-primary-900 text-white hover:bg-primary-800 text-sm"
                              >
                                <Eye className="w-4 h-4" />
                                <span>View Ticket</span>
                              </button>
                              <button
                                onClick={() => alert("Download feature coming soon")}
                                className="flex items-center space-x-2 px-4 py-2 border border-primary-900 text-primary-900 hover:bg-primary-50 text-sm"
                              >
                                <Download className="w-4 h-4" />
                                <span>Download</span>
                              </button>
                            </>
                          )}

                          {booking.status === "pending" && !isExpired && (
                            <button
                              onClick={() => handleCompletePayment(booking)}
                              className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white hover:bg-yellow-700 text-sm"
                            >
                              <CreditCard className="w-4 h-4" />
                              <span>Complete Payment</span>
                            </button>
                          )}

                          {(booking.status === "cancelled" || isExpired) && (
                            <button
                              onClick={() => handleRetry(booking)}
                              className="flex items-center space-x-2 px-4 py-2 border border-primary-900 text-primary-900 hover:bg-primary-50 text-sm"
                            >
                              <RefreshCw className="w-4 h-4" />
                              <span>Book Again</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
