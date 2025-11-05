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
import { fetchAllBookings, updateProfile } from "../utils/backendApi";
import { getImageUrl } from "../utils/api";

const Profile = () => {
  const { user, isAuthenticated, updateUser: updateAuthUser } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
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

  // Fetch bookings function (can be called multiple times)
  const fetchBookings = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      // Fetch bookings for the logged-in user's email
      const data = await fetchAllBookings({ email: user.email });
      console.log(`✅ Loaded ${data.length} booking(s) for ${user.email}`);
      setBookings(data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("❌ Failed to fetch bookings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch bookings on mount only
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
      return;
    }

    if (user?.email) {
      fetchBookings();
    }
  }, [isAuthenticated, navigate, user?.email]);

  // Auto-refresh every 30 seconds (instead of on every focus)
  useEffect(() => {
    if (!user?.email) return;

    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing bookings (30s interval)...');
      fetchBookings();
    }, 30000); // 30 seconds

    return () => clearInterval(refreshInterval);
  }, [user?.email]);

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async () => {
    setUpdateLoading(true);
    try {
      const updatedUser = await updateProfile(editForm);
      updateAuthUser(updatedUser);
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
      <div className="min-h-screen bg-base-900 grid place-items-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-cinema-red mx-auto mb-4" />
          <p className="text-text-muted">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* Profile Header */}
        <div className="pb-6 border-b border-surface-border/50 mb-6">
          <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-text mb-1">My Profile</h1>
              <p className="text-sm text-text-muted">Manage your account</p>
            </div>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="btn-secondary flex items-center gap-2">
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={handleUpdateProfile} disabled={updateLoading} className="btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({ name: user?.name || "", phone: user?.phone || "" });
                  }}
                  className="btn-ghost flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs text-text-dim mb-1">Name</p>
              {isEditing ? (
                <input type="text" name="name" value={editForm.name} onChange={handleEditChange} className="input-field" placeholder="Your name" />
              ) : (
                <p className="font-medium text-text">{user?.name}</p>
              )}
            </div>

            <div>
              <p className="text-xs text-text-dim mb-1">Email</p>
              <p className="font-medium text-text truncate">{user?.email}</p>
            </div>

            <div>
              <p className="text-xs text-text-dim mb-1">Phone</p>
              {isEditing ? (
                <input type="tel" name="phone" value={editForm.phone} onChange={handleEditChange} className="input-field" placeholder="Your phone" />
              ) : (
                <p className="font-medium text-text">{user?.phone}</p>
              )}
            </div>

            <div>
              <p className="text-xs text-text-dim mb-1">Total Bookings</p>
              <p className="font-medium text-text">{bookings.length}</p>
            </div>
          </div>
        </div>

        {/* Bookings Section */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-text">My Bookings</h2>
              {lastUpdated && (
                <p className="text-xs text-text-dim mt-0.5">
                  Updated {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
            <button onClick={fetchBookings} disabled={loading} className="btn-secondary flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {error ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-10 w-10 text-text-dim mb-3" />
              <h3 className="text-base font-medium text-text mb-1">Failed to load bookings</h3>
              <p className="text-sm text-text-muted">{error}</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="h-10 w-10 mx-auto mb-3 text-text-dim" />
              <h3 className="text-base font-medium text-text mb-1">No bookings yet</h3>
              <p className="text-sm text-text-muted mb-4">Start booking your favorite movies now!</p>
              <button onClick={() => navigate("/")} className="btn-primary">Browse Movies</button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const timeRemaining = booking.status === "pending" ? getTimeRemaining(booking.lockedUntil) : null;
                const isExpired = timeRemaining === "Expired";

                return (
                  <div key={booking._id} className="border border-surface-border/50 rounded p-4 hover:border-text/20 transition-colors">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Poster */}
                      <div className="flex-shrink-0">
                        {booking.movieId?.posterPath ? (
                          <img
                            src={getImageUrl(booking.movieId.posterPath, "poster", "small")}
                            alt={booking.movieId?.title}
                            className="w-16 h-24 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-24 flex items-center justify-center bg-surface-light rounded">
                            <Ticket className="h-6 w-6 text-text-dim" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-text truncate">{booking.movieId?.title || "Movie"}</h3>
                            <p className="text-xs text-text-dim mt-0.5">ID: {booking.bookingId}</p>
                          </div>
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded ${getStatusColor(booking.status)}`}>
                            {booking.status?.toUpperCase()}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-3">
                          <div>
                            <p className="text-xs text-text-dim">Date</p>
                            <p className="text-text">{formatDate(booking.showtime?.date)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-dim">Time</p>
                            <p className="text-text">{formatTime(booking.showtime?.time)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-dim">Seats</p>
                            <p className="text-text truncate">{booking.seats?.map((s) => s.seatId).join(", ")}</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-dim">Total</p>
                            <p className="text-text font-medium">${booking.totalAmount?.toFixed(2)}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          {booking.status === "confirmed" && (
                            <>
                              <button onClick={() => handleViewTicket(booking)} className="btn-secondary text-xs py-2 px-3">
                                <Eye className="w-3 h-3 inline mr-1" />
                                View
                              </button>
                              <button onClick={() => alert("Download coming soon")} className="btn-ghost text-xs py-2 px-3">
                                <Download className="w-3 h-3 inline mr-1" />
                                Download
                              </button>
                            </>
                          )}
                          {booking.status === "pending" && !isExpired && (
                            <button onClick={() => handleCompletePayment(booking)} className="btn-primary text-xs py-2 px-3">
                              <CreditCard className="w-3 h-3 inline mr-1" />
                              Complete Payment
                            </button>
                          )}
                          {(booking.status === "cancelled" || isExpired) && (
                            <button onClick={() => handleRetry(booking)} className="btn-secondary text-xs py-2 px-3">
                              <RefreshCw className="w-3 h-3 inline mr-1" />
                              Book Again
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
