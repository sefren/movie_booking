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

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
    name: "",
    email: "",
    phone: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Backend data
  const [useBackend, setUseBackend] = useState(true);
  const [backendMovie, setBackendMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [showtimesLoading, setShowtimesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Fetch showtimes when date changes
  useEffect(() => {
    const loadShowtimes = async () => {
      if (!useBackend || !id) return;

      setShowtimesLoading(true);
      try {
        const showtimeData = await fetchMovieShowtimes(id, selectedDate);
        const formatted = showtimeData.showtimes.map(formatShowtime);
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
      if (!selectedShowtime?.id || !selectedDate || !useBackend) {
        console.log(" Skipping occupied seats load");
        return;
      }

      console.log(
        " Loading occupied seats for showtime:",
        selectedShowtime.id,
      );
      try {
        const occupied = await fetchOccupiedSeats(
          id,
          selectedDate,
          selectedShowtime.id,
        );
        console.log(" Occupied seats loaded:", occupied.length);
        setOccupiedSeats(occupied);
      } catch (err) {
        console.error(" Failed to load occupied seats:", err);
        setOccupiedSeats([]);
      }
    };

    loadOccupiedSeats();
  }, [id, selectedDate, selectedShowtime?.id, useBackend]);

  // Generate available dates (next 7 days)
  const getAvailableDates = () => {
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
  };

  const availableDates = getAvailableDates();

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
        const seats = selectedSeats.map((seatId) => {
          const row = seatId.charAt(0);
          const number = parseInt(seatId.substring(1));
          return { seatId, row, number };
        });

        const bookingRequest = {
          movieId: id,
          screenId: selectedShowtime.screenId?._id || selectedShowtime.screenId,
          showtime: {
            time: selectedShowtime.time,
            date: new Date(selectedDate),
          },
          seats,
          customerInfo: bookingForm,
          totalAmount: calculateTotal(),
        };

        const createdBooking = await createBooking(bookingRequest);

        // Store booking data for payment page
        bookingData = {
          bookingId: createdBooking.bookingId,
          _id: createdBooking._id,
          movie: {
            id: backendMovie?._id || id,
            title: backendMovie?.title || tmdbMovie?.title,
            poster_path: backendMovie?.posterPath || tmdbMovie?.poster_path,
            runtime: backendMovie?.duration || tmdbMovie?.runtime,
          },
          showtime: selectedShowtime,
          date: selectedDate,
          seats: selectedSeats,
          customerInfo: bookingForm,
          total: calculateTotal(),
          status: createdBooking.status,
          lockedUntil: createdBooking.lockedUntil,
        };

        console.log(" Booking created with backend:", bookingData);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Movie Poster */}
            <div className="flex-shrink-0">
              <img
                src={posterUrl}
                alt={movieTitle}
                className="w-48 h-72 object-cover border border-white/20"
                onError={(e) => {
                  e.target.src = "/placeholder-movie-poster.jpg";
                }}
              />
            </div>

            {/* Movie Info */}
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                {movieTitle}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-white/80 mb-4">
                {movieRating && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span>{movieRating.toFixed(1)}</span>
                  </div>
                )}

                {movieDuration && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{movieDuration} min</span>
                  </div>
                )}

                {movieReleaseDate && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(movieReleaseDate).getFullYear()}</span>
                  </div>
                )}
              </div>

              {movieGenres && movieGenres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {movieGenres.slice(0, 3).map((genre, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white/20 text-white text-sm font-medium border border-white/30"
                    >
                      {typeof genre === "string" ? genre : genre.name}
                    </span>
                  ))}
                </div>
              )}

              {movieOverview && (
                <p className="text-white/90 leading-relaxed max-w-3xl">
                  {movieOverview}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Date, Time & Seats */}
          <div className="lg:col-span-2 space-y-8">
            {/* Date & Time Selection */}
            <div className="bg-white border border-primary-200 p-6">
              <h2 className="text-xl font-semibold text-primary-900 mb-6">
                Select Date & Time
              </h2>

              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-primary-700 mb-3">
                  Date
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {availableDates.map((date) => (
                    <button
                      key={date.value}
                      onClick={() => setSelectedDate(date.value)}
                      className={`p-3 text-sm font-medium border transition-all duration-200 ${
                        selectedDate === date.value
                          ? "bg-primary-900 text-white border-primary-900"
                          : "bg-white text-primary-600 border-primary-200 hover:border-primary-900"
                      }`}
                    >
                      {date.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-3">
                  Showtime {useBackend && showtimesLoading && "(Loading...)"}
                </label>
                {useBackend && showtimes.length === 0 && !showtimesLoading ? (
                  <p className="text-primary-500 text-sm p-4 bg-primary-50 border border-primary-200">
                    No showtimes available for this date
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {useBackend
                      ? showtimes.map((showtime) => (
                          <button
                            key={showtime.id}
                            onClick={() => setSelectedShowtime(showtime)}
                            className={`p-4 text-left border transition-all duration-200 ${
                              selectedShowtime?.id === showtime.id
                                ? "bg-primary-900 text-white border-primary-900"
                                : "bg-white text-primary-600 border-primary-200 hover:border-primary-900"
                            }`}
                          >
                            <div className="font-semibold text-base mb-1">
                              {showtime.time}
                            </div>
                            <div className="text-xs opacity-80">
                              {showtime.screenName}  {showtime.screenType}
                            </div>
                            <div className="text-xs opacity-70 mt-1">
                              {showtime.availableSeats} seats available
                            </div>
                          </button>
                        ))
                      : SHOW_TIMES.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedShowtime({ time })}
                            className={`p-3 text-sm font-medium border transition-all duration-200 ${
                              selectedShowtime?.time === time
                                ? "bg-primary-900 text-white border-primary-900"
                                : "bg-white text-primary-600 border-primary-200 hover:border-primary-900"
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
            <div className="bg-white border border-primary-200 p-6">
              <h2 className="text-xl font-semibold text-primary-900 mb-6">
                Select Seats
              </h2>
              {formErrors.seats && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
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
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white border border-primary-200 p-6">
              <h2 className="text-xl font-semibold text-primary-900 mb-6">
                Customer Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-primary-700 mb-2"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={bookingForm.name}
                    onChange={handleInputChange}
                    className={`input-field ${formErrors.name ? "border-red-500" : ""}`}
                    placeholder="Enter your full name"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-primary-700 mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={bookingForm.email}
                    onChange={handleInputChange}
                    className={`input-field ${formErrors.email ? "border-red-500" : ""}`}
                    placeholder="Enter your email"
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-primary-700 mb-2"
                  >
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={bookingForm.phone}
                    onChange={handleInputChange}
                    className={`input-field ${formErrors.phone ? "border-red-500" : ""}`}
                    placeholder="Enter your phone number"
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="bg-primary-50 border border-primary-200 p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-primary-900 mb-4">
                Booking Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-primary-600">Movie:</span>
                  <span className="font-medium text-primary-900">
                    {movieTitle}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-primary-600">Date:</span>
                  <span className="font-medium text-primary-900">
                    {new Date(selectedDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
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

                <div className="flex justify-between">
                  <span className="text-primary-600">Seats:</span>
                  <span className="font-medium text-primary-900">
                    {selectedSeats.length > 0
                      ? selectedSeats.join(", ")
                      : "None selected"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-primary-600">Quantity:</span>
                  <span className="font-medium text-primary-900">
                    {selectedSeats.length} tickets
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-primary-600">Price per ticket:</span>
                  <span className="font-medium text-primary-900">
                    {THEATER_CONFIG.currencySymbol}
                    {THEATER_CONFIG.pricePerSeat.toFixed(2)}
                  </span>
                </div>

                <div className="divider my-4"></div>

                <div className="flex justify-between text-lg font-semibold">
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
                className="w-full mt-6 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Proceed to Payment</span>
                  </>
                )}
              </button>

              <p className="text-xs text-primary-500 mt-3 text-center">
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
