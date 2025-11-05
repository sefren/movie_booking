import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMovieDetails } from "../hooks/useMovies";
import SeatGrid from "../components/SeatGrid";
import {
  Star,
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { getImageUrl } from "../utils/api";
import {
  fetchMovieById,
  fetchMovieShowtimes,
  fetchAvailableDates,
  fetchOccupiedSeats,
  createBooking,
  formatShowtime,
  checkBackendHealth,
} from "../utils/backendApi";
import {
  THEATER_CONFIG,
  SHOW_TIMES,
  VALIDATION_RULES,
  ERROR_MESSAGES,
} from "../utils/constants";
import { useAuth } from "../contexts/AuthContext";

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Check if ID is a MongoDB ObjectId (24 hex characters) or numeric TMDB ID
  const isMongoId = id && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id);

  // Only fetch from TMDB if it's a numeric ID
  const { movie: tmdbMovie } = useMovieDetails(!isMongoId ? id : null);

  // Booking state
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [bookingForm, setBookingForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Backend data
  const [useBackend, setUseBackend] = useState(true);
  const [backendMovie, setBackendMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [showtimesLoading, setShowtimesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Auto-fill form when user logs in
  useEffect(() => {
    if (isAuthenticated() && user) {
      setBookingForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user, isAuthenticated]);

  // Check backend availability and fetch movie
  useEffect(() => {
    const checkAndFetch = async () => {
      console.log(" Booking page loaded for movie ID:", id);
      console.log(" ID Type:", isMongoId ? "MongoDB ObjectId" : "TMDB ID");

      setLoading(true);
      setError(null);

      try {
        const isAvailable = await checkBackendHealth();
        console.log(" Backend available:", isAvailable);

        if (isAvailable && id) {
          try {
            console.log(" Fetching movie from backend:", id);
            const movieData = await fetchMovieById(id);
            console.log(" Backend movie data received:", movieData);
            console.log(" Movie title:", movieData?.title);
            setBackendMovie(movieData);
            setUseBackend(true);
          } catch (err) {
            console.error(" Failed to fetch movie from backend:", err);
            console.log(" Falling back to TMDB data");
            setUseBackend(false);
          }
        } else {
          console.log(" Backend not available or no ID");
          setUseBackend(false);
        }
      } catch (err) {
        console.error(" Error in checkAndFetch:", err);
        setUseBackend(false);
      } finally {
        console.log(" Setting loading to false");
        setLoading(false);
      }
    };

    if (id) {
      checkAndFetch();
    } else {
      console.error(" No movie ID provided");
      setError("No movie ID provided");
      setLoading(false);
    }
  }, [id, isMongoId]);

  // Fetch available dates when movie is loaded
  useEffect(() => {
    const loadAvailableDates = async () => {
      if (!useBackend || !id || !backendMovie) return;

      console.log('📅 Fetching available dates for movie:', id);
      try {
        const dates = await fetchAvailableDates(id);
        console.log('✓ Available dates:', dates);

        if (dates.length === 0) {
          console.warn('⚠️ This movie has no showtimes scheduled');
          setAvailableDates([]);
          setShowtimes([]);
          setError('This movie currently has no scheduled showtimes. Please check back later.');
          return;
        }

        setAvailableDates(dates);
        setError(null);

        // Auto-select first available date if no date selected or selected date has no showtimes
        if (dates.length > 0 && !dates.includes(selectedDate)) {
          const firstDate = dates[0];
          console.log('📅 Auto-selecting first available date:', firstDate);
          setSelectedDate(firstDate);
        }
      } catch (error) {
        console.error('Failed to fetch available dates:', error);
        setAvailableDates([]);
        setError('Failed to load showtimes. Please try again.');
      }
    };

    loadAvailableDates();
  }, [useBackend, id, backendMovie]);

  // Fetch showtimes when date changes
  useEffect(() => {
    const loadShowtimes = async () => {
      if (!useBackend || !id) return;

      setShowtimesLoading(true);
      try {
        const showtimeData = await fetchMovieShowtimes(id, selectedDate);

        // Console log to see all showtimes data
        console.log('📅 Showtimes Data Received:', {
          date: selectedDate,
          rawData: showtimeData,
          showtimesCount: showtimeData.showtimes?.length || 0,
          showtimes: showtimeData.showtimes
        });

        const formatted = showtimeData.showtimes.map(formatShowtime);

        console.log('✅ Formatted Showtimes:', formatted);
        console.log('📊 Showtimes Summary:', formatted.map(st => ({
          time: st.time,
          screen: st.screenName,
          type: st.screenType,
          price: `$${st.price}`,
          availableSeats: st.availableSeats
        })));

        setShowtimes(formatted);

        // Auto-select first showtime
        if (formatted.length > 0 && !selectedShowtime) {
          setSelectedShowtime(formatted[0]);
        }
      } catch (error) {
        console.error("Failed to fetch showtimes:", error);
        setShowtimes([]);
      } finally {
        setShowtimesLoading(false);
      }
    };

    loadShowtimes();
  }, [id, selectedDate, useBackend]);

  // Load occupied seats when showtime changes
  useEffect(() => {
    const loadOccupiedSeats = async () => {
      if (!selectedShowtime || !selectedDate || !useBackend) {
        console.log("Skipping occupied seats load");
        return;
      }

      console.log("Loading occupied seats for showtime:", selectedShowtime);
      try {
        // Pass the full showtime object (not just ID)
        const occupied = await fetchOccupiedSeats(
          id,
          selectedDate,
          selectedShowtime, // This object contains time and screenId
        );
        console.log("Occupied seats loaded:", occupied.length);
        setOccupiedSeats(occupied);
      } catch (err) {
        console.error("❌ Failed to load occupied seats:", err);
        setOccupiedSeats([]);
      }
    };

    loadOccupiedSeats();
  }, [id, selectedDate, selectedShowtime?.id, useBackend]);

  // Format available dates for display
  const getFormattedAvailableDates = () => {
    if (useBackend && availableDates.length > 0) {
      // Filter to only show dates within next 14 days
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const maxDate = new Date(today);
      maxDate.setDate(maxDate.getDate() + 14);

      const filteredDates = availableDates.filter(dateStr => {
        const date = new Date(dateStr + 'T00:00:00');
        return date >= today && date <= maxDate;
      });

      // Use filtered dates from backend
      return filteredDates.map(dateStr => ({
        value: dateStr,
        label: new Date(dateStr + 'T00:00:00').toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
      }));
    } else if (!useBackend) {
      // Fallback: generate next 7 days for TMDB movies
      const dates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        dates.push({
          value: date.toISOString().split("T")[0],
          label: date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
        });
      }
      return dates;
    }
    return [];
  };

  const formattedAvailableDates = getFormattedAvailableDates();

  // Handle seat selection
  const handleSeatSelect = (seatId, isSelecting) => {
    if (
      isSelecting &&
      selectedSeats.length >= VALIDATION_RULES.maxSeatsPerBooking
    ) {
      alert(ERROR_MESSAGES.maxSeatsExceeded);
      return;
    }

    setSelectedSeats((prev) =>
      isSelecting ? [...prev, seatId] : prev.filter((id) => id !== seatId),
    );
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!bookingForm.name.trim()) {
      errors.name = "Name is required";
    } else if (bookingForm.name.length < VALIDATION_RULES.name.minLength) {
      errors.name = `Name must be at least ${VALIDATION_RULES.name.minLength} characters`;
    } else if (!VALIDATION_RULES.name.pattern.test(bookingForm.name)) {
      errors.name = ERROR_MESSAGES.invalidName;
    }

    // Email validation
    if (!bookingForm.email.trim()) {
      errors.email = "Email is required";
    } else if (!VALIDATION_RULES.email.pattern.test(bookingForm.email)) {
      errors.email = ERROR_MESSAGES.invalidEmail;
    }

    // Phone validation
    if (!bookingForm.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!VALIDATION_RULES.phone.pattern.test(bookingForm.phone)) {
      errors.phone = ERROR_MESSAGES.invalidPhone;
    }

    // Seats validation
    if (selectedSeats.length === 0) {
      errors.seats = ERROR_MESSAGES.noSeatsSelected;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Calculate total price
  const calculateTotal = () => {
    return selectedSeats.length * THEATER_CONFIG.pricePerSeat;
  };

  // Handle booking submission
  const handleBooking = async () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      let bookingData;

      if (useBackend && selectedShowtime?.id) {
        // Use backend API for real booking
        // Format seats with price for backend
        const seats = selectedSeats.map((seatId) => {
          const row = seatId.charAt(0);
          const number = parseInt(seatId.substring(1));
          return {
            seatId,
            row,
            number,
            price: selectedShowtime.price || THEATER_CONFIG.pricePerSeat
          };
        });

        // Backend expects: showtimeId, selectedSeats, customerName, customerEmail, customerPhone
        const bookingRequest = {
          showtimeId: selectedShowtime.id,
          selectedSeats: seats,
          customerName: bookingForm.name,
          customerEmail: bookingForm.email,
          customerPhone: bookingForm.phone,
        };

        console.log('📤 Booking request:', bookingRequest);

        const createdBooking = await createBooking(bookingRequest);

        console.log('✅ Booking response:', createdBooking);

        // Store booking data for payment page
        bookingData = {
          bookingId: createdBooking._id,
          _id: createdBooking._id,
          movie: {
            id: backendMovie?._id || id,
            title: backendMovie?.title || tmdbMovie?.title,
            poster_path: backendMovie?.posterUrl || tmdbMovie?.poster_path,
            runtime: backendMovie?.duration || tmdbMovie?.runtime,
          },
          showtime: selectedShowtime,
          date: selectedDate,
          seats: selectedSeats,
          customerInfo: bookingForm,
          total: createdBooking.totalAmount,
          status: createdBooking.status,
          transactionId: createdBooking.transactionId,
          screenName: createdBooking.screenId?.name,
          screenType: createdBooking.screenId?.screenType,
        };

        console.log("✅ Booking created successfully:", bookingData);
      } else {
        // Fallback to mock booking
        await new Promise((resolve) => setTimeout(resolve, 1000));

        bookingData = {
          movie: {
            id: tmdbMovie?.id,
            title: tmdbMovie?.title,
            poster_path: tmdbMovie?.poster_path,
            runtime: tmdbMovie?.runtime,
          },
          showtime: selectedShowtime,
          date: selectedDate,
          seats: selectedSeats,
          customerInfo: bookingForm,
          total: calculateTotal(),
          bookingId: `BK${Date.now()}`,
        };

        console.log(" Mock booking created (backend unavailable)");
      }

      localStorage.setItem("currentBooking", JSON.stringify(bookingData));
      navigate("/payment");
    } catch (error) {
      console.error("Booking failed:", error);
      alert(error.message || ERROR_MESSAGES.bookingFailed);
    } finally {
      setIsProcessing(false);
    }
  };

  // Use backend movie if available, otherwise fallback to TMDB
  const displayMovie = useBackend && backendMovie ? backendMovie : tmdbMovie;

  console.log(" Display movie data:", {
    loading,
    useBackend,
    hasBackendMovie: !!backendMovie,
    hasTmdbMovie: !!tmdbMovie,
    backendMovieTitle: backendMovie?.title,
    tmdbMovieTitle: tmdbMovie?.title,
    displayMovieTitle: displayMovie?.title,
    displayMovie: displayMovie,
  });

  if (loading) {
    console.log(" Booking page still loading...");
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-900 mx-auto mb-4" />
          <p className="text-primary-600">Loading movie details...</p>
        </div>
      </div>
    );
  }

  // If we have backend movie but no TMDB movie, that's fine
  if (!displayMovie) {
    console.error(" No movie data available, showing error");
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-primary-900 mb-2">
            Movie not found
          </h3>
          <p className="text-primary-600 mb-4">
            {error || "The requested movie could not be found."}
          </p>
          <button onClick={() => navigate("/")} className="btn-primary">
            Back to Movies
          </button>
        </div>
      </div>
    );
  }

  const posterUrl = getImageUrl(
    displayMovie?.posterPath || displayMovie?.poster_path,
    "poster",
    "large",
  );

  const movieTitle = displayMovie?.title || "Movie";
  const movieRating = displayMovie?.rating || displayMovie?.vote_average;
  const movieDuration = displayMovie?.duration || displayMovie?.runtime;
  const movieReleaseDate =
    displayMovie?.releaseDate || displayMovie?.release_date;
  const movieGenres = displayMovie?.genres || [];
  const movieOverview = displayMovie?.overview || displayMovie?.description;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors mb-3 sm:mb-4"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm md:text-base">Back</span>
          </button>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6">
            {/* Movie Poster */}
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              <img
                src={posterUrl}
                alt={movieTitle}
                className="w-28 h-40 xs:w-32 xs:h-48 sm:w-36 sm:h-54 md:w-40 md:h-60 lg:w-48 lg:h-72 object-cover border border-white/20 rounded-sm"
                onError={(e) => {
                  e.target.src = "/placeholder-movie-poster.jpg";
                }}
              />
            </div>

            {/* Movie Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl xs:text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
                {movieTitle}
              </h1>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm md:text-base text-white/80 mb-2 sm:mb-3 md:mb-4">
                {movieRating && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                    <span>{movieRating.toFixed(1)}</span>
                  </div>
                )}

                {movieDuration && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{movieDuration} min</span>
                  </div>
                )}

                {movieReleaseDate && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{new Date(movieReleaseDate).getFullYear()}</span>
                  </div>
                )}
              </div>

              {movieGenres && movieGenres.length > 0 && (
                <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                  {movieGenres.slice(0, 3).map((genre, index) => (
                    <span
                      key={index}
                      className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 text-white text-xs sm:text-sm font-medium border border-white/30 rounded-sm"
                    >
                      {typeof genre === "string" ? genre : genre.name}
                    </span>
                  ))}
                </div>
              )}

              {movieOverview && (
                <p className="text-xs sm:text-sm md:text-base text-white/90 leading-relaxed line-clamp-3 sm:line-clamp-4 md:line-clamp-none">
                  {movieOverview}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Date, Time & Seats */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 md:space-y-8">
            {/* Date & Time Selection */}
            <div className="bg-white border border-primary-200 rounded-lg p-3 sm:p-4 md:p-6">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-primary-900 mb-3 sm:mb-4 md:mb-6">
                Select Date & Time
              </h2>

              {/* Date Selection */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-medium text-primary-700 mb-2 sm:mb-3">
                  Date
                </label>
                {formattedAvailableDates.length === 0 ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-center">
                    <p className="text-yellow-800 text-sm font-medium mb-1">
                      ⚠️ No Showtimes Scheduled
                    </p>
                    <p className="text-yellow-600 text-xs">
                      This movie currently has no scheduled showtimes. Please check back later or choose another movie.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-1.5 sm:gap-2">
                    {formattedAvailableDates.map((date) => (
                      <button
                        key={date.value}
                        onClick={() => setSelectedDate(date.value)}
                        className={`p-1.5 sm:p-2 md:p-3 text-center border rounded transition-all duration-200 text-xs sm:text-sm ${
                          selectedDate === date.value
                            ? "bg-primary-900 text-white border-primary-900 shadow-md"
                            : "bg-white text-primary-600 border-primary-200 hover:border-primary-900 hover:shadow-sm"
                        }`}
                      >
                        <div className="font-medium">{date.label}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Showtime Selection */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-primary-700 mb-2 sm:mb-3">
                  Showtime {useBackend && showtimesLoading && "(Loading...)"}
                </label>
                {useBackend && showtimes.length === 0 && !showtimesLoading ? (
                  <p className="text-primary-500 text-xs sm:text-sm p-3 sm:p-4 bg-primary-50 border border-primary-200 rounded">
                    No showtimes available for this date
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                    {useBackend
                      ? showtimes.map((showtime) => (
                          <button
                            key={showtime.id}
                            onClick={() => setSelectedShowtime(showtime)}
                            disabled={showtime.availableSeats === 0}
                            className={`p-2 sm:p-3 md:p-4 text-left border rounded transition-all duration-200 ${
                              selectedShowtime?.id === showtime.id
                                ? "bg-primary-900 text-white border-primary-900 shadow-md"
                                : showtime.availableSeats === 0
                                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                : "bg-white text-primary-600 border-primary-200 hover:border-primary-900 hover:shadow-sm"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-bold text-sm sm:text-base md:text-lg">
                                {showtime.time}
                              </div>
                              <div className="font-semibold text-xs sm:text-sm">
                                ${showtime.price?.toFixed(2)}
                              </div>
                            </div>
                            <div className="text-xs opacity-80 mb-0.5">
                              {showtime.screenName}
                            </div>
                            <div className="flex items-center justify-between text-xs opacity-70">
                              <span className={`font-medium ${
                                showtime.screenType === 'IMAX' ? 'text-blue-400' :
                                showtime.screenType === 'Dolby' ? 'text-purple-400' :
                                showtime.screenType === '3D' ? 'text-green-400' :
                                ''
                              }`}>
                                {showtime.screenType}
                              </span>
                              <span className={showtime.availableSeats < 20 ? 'text-red-400 font-medium' : ''}>
                                {showtime.availableSeats === 0 ? 'Sold Out' : `${showtime.availableSeats} seats`}
                              </span>
                            </div>
                          </button>
                        ))
                      : SHOW_TIMES.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedShowtime({ time })}
                            className={`p-2 sm:p-3 text-xs sm:text-sm font-medium border rounded transition-all duration-200 ${
                              selectedShowtime?.time === time
                                ? "bg-primary-900 text-white border-primary-900 shadow-md"
                                : "bg-white text-primary-600 border-primary-200 hover:border-primary-900 hover:shadow-sm"
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                  </div>
                )}
              </div>
            </div>

            {/* Seat Selection */}
            <div className="bg-white border border-primary-200 rounded-lg p-3 sm:p-4 md:p-6 overflow-x-auto">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-primary-900 mb-2 sm:mb-3 md:mb-4">
                Select Seats
              </h3>
              {formErrors.seats && (
                <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs sm:text-sm">
                  {formErrors.seats}
                </div>
              )}
              <SeatGrid
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
                occupiedSeats={occupiedSeats}
              />
            </div>
          </div>

          {/* Right Column - Customer Info & Summary */}
          <div className="space-y-4 sm:space-y-6">
            {/* Customer Information */}
            <div className="bg-white border border-primary-200 rounded-lg p-3 sm:p-4 md:p-6">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-primary-900 mb-3 sm:mb-4 md:mb-6">
                Customer Information
              </h2>

              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs sm:text-sm font-medium text-primary-700 mb-1.5 sm:mb-2"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={bookingForm.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                      formErrors.name ? "border-red-500" : "border-primary-200"
                    }`}
                    placeholder="Enter your full name"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs sm:text-sm font-medium text-primary-700 mb-1.5 sm:mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={bookingForm.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                      formErrors.email ? "border-red-500" : "border-primary-200"
                    }`}
                    placeholder="Enter your email"
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xs sm:text-sm font-medium text-primary-700 mb-1.5 sm:mb-2"
                  >
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={bookingForm.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                      formErrors.phone ? "border-red-500" : "border-primary-200"
                    }`}
                    placeholder="Enter your phone number"
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600">
                      {formErrors.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 sm:p-4 md:p-6 lg:sticky lg:top-4">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-primary-900 mb-2 sm:mb-3 md:mb-4">
                Booking Summary
              </h3>

              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between items-start">
                  <span className="text-primary-600">Movie:</span>
                  <span className="font-medium text-primary-900 text-right max-w-[60%]">
                    {movieTitle}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-primary-600">Date:</span>
                  <span className="font-medium text-primary-900 text-right">
                    {new Date(selectedDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-primary-600">Time:</span>
                  <span className="font-medium text-primary-900">
                    {selectedShowtime?.time || "Not selected"}
                  </span>
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-primary-600">Seats:</span>
                  <span className="font-medium text-primary-900 text-right max-w-[60%] break-words">
                    {selectedSeats.length > 0
                      ? selectedSeats.join(", ")
                      : "None selected"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-primary-600">Quantity:</span>
                  <span className="font-medium text-primary-900">
                    {selectedSeats.length}{" "}
                    {selectedSeats.length === 1 ? "ticket" : "tickets"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-primary-600">Price/ticket:</span>
                  <span className="font-medium text-primary-900">
                    {THEATER_CONFIG.currencySymbol}
                    {THEATER_CONFIG.pricePerSeat.toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-primary-300 my-2 sm:my-3"></div>

                <div className="flex justify-between text-base sm:text-lg font-semibold pt-1">
                  <span className="text-primary-900">Total:</span>
                  <span className="text-primary-900">
                    {THEATER_CONFIG.currencySymbol}
                    {calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={isProcessing || selectedSeats.length === 0}
                className="w-full mt-4 sm:mt-6 px-4 py-2.5 sm:py-3 bg-primary-900 text-white rounded-md font-medium text-xs sm:text-sm md:text-base hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all shadow-sm hover:shadow-md"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Proceed to Payment</span>
                  </>
                )}
              </button>

              <p className="text-xs text-primary-500 mt-2 sm:mt-3 text-center leading-relaxed">
                By proceeding, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
