import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMovieDetails } from "../hooks/useMovies";
import SeatGrid from "../components/SeatGrid";
import {
    Star,
    Calendar,
    Clock,
    ArrowLeft,
    Loader2,
    AlertCircle,
    CheckCircle,
    Globe,
    Shield,
    Film,
    User,
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

    const isMongoId = id && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id);
    const { movie: tmdbMovie } = useMovieDetails(!isMongoId ? id : null);

    // Booking state
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [selectedShowtime, setSelectedShowtime] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
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

    // Autofill on auth
    useEffect(() => {
        if (isAuthenticated() && user) {
            setBookingForm({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
            });
        }
    }, [user, isAuthenticated]);

    // Check backend + fetch movie
    useEffect(() => {
        const checkAndFetch = async () => {
            setLoading(true);
            setError(null);
            try {
                const isAvailable = await checkBackendHealth();
                if (isAvailable && id) {
                    try {
                        const movieData = await fetchMovieById(id);
                        setBackendMovie(movieData);
                        setUseBackend(true);
                    } catch {
                        setUseBackend(false);
                    }
                } else {
                    setUseBackend(false);
                }
            } catch {
                setUseBackend(false);
            } finally {
                setLoading(false);
            }
        };
        if (id) checkAndFetch();
        else {
            setError("No movie ID provided");
            setLoading(false);
        }
    }, [id, isMongoId]);

    // Available dates
    useEffect(() => {
        const loadAvailableDates = async () => {
            if (!useBackend || !id || !backendMovie) return;
            try {
                const dates = await fetchAvailableDates(id);
                if (dates.length === 0) {
                    setAvailableDates([]);
                    setShowtimes([]);
                    setError("This movie currently has no scheduled showtimes. Please check back later.");
                    return;
                }
                setAvailableDates(dates);
                setError(null);
                if (dates.length > 0 && !dates.includes(selectedDate)) {
                    setSelectedDate(dates[0]);
                }
            } catch {
                setAvailableDates([]);
                setError("Failed to load showtimes. Please try again.");
            }
        };
        loadAvailableDates();
    }, [useBackend, id, backendMovie]);

    // Showtimes by date
    useEffect(() => {
        const loadShowtimes = async () => {
            if (!useBackend || !id) return;
            setShowtimesLoading(true);
            try {
                const showtimeData = await fetchMovieShowtimes(id, selectedDate);
                const formatted = (showtimeData.showtimes || []).map(formatShowtime);
                setShowtimes(formatted);
                if (formatted.length > 0 && !selectedShowtime) {
                    setSelectedShowtime(formatted[0]);
                }
            } catch {
                setShowtimes([]);
            } finally {
                setShowtimesLoading(false);
            }
        };
        loadShowtimes();
    }, [id, selectedDate, useBackend]);

    // Occupied seats
    useEffect(() => {
        const loadOccupiedSeats = async () => {
            if (!selectedShowtime || !selectedDate || !useBackend) return;
            try {
                const occupied = await fetchOccupiedSeats(id, selectedDate, selectedShowtime);
                setOccupiedSeats(occupied);
            } catch {
                setOccupiedSeats([]);
            }
        };
        loadOccupiedSeats();
    }, [id, selectedDate, selectedShowtime?.id, useBackend]);

    // Dates UI
    const getFormattedAvailableDates = () => {
        if (useBackend && availableDates.length > 0) {
            const today = new Date(); today.setHours(0, 0, 0, 0);
            const maxDate = new Date(today); maxDate.setDate(maxDate.getDate() + 14);
            const filtered = availableDates.filter(d => {
                const dt = new Date(d + "T00:00:00");
                return dt >= today && dt <= maxDate;
            });
            return filtered.map(d => ({
                value: d,
                label: new Date(d + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "short", month: "short", day: "numeric",
                }),
            }));
        } else if (!useBackend) {
            const dates = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date(); date.setDate(date.getDate() + i);
                dates.push({
                    value: date.toISOString().split("T")[0],
                    label: date.toLocaleDateString("en-US", {
                        weekday: "short", month: "short", day: "numeric",
                    }),
                });
            }
            return dates;
        }
        return [];
    };
    const formattedAvailableDates = getFormattedAvailableDates();

    // Seat select
    const handleSeatSelect = (seatId, isSelecting) => {
        if (isSelecting && selectedSeats.length >= VALIDATION_RULES.maxSeatsPerBooking) {
            alert(ERROR_MESSAGES.maxSeatsExceeded);
            return;
        }
        setSelectedSeats(prev => (isSelecting ? [...prev, seatId] : prev.filter(x => x !== seatId)));
    };

    // Form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBookingForm(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: "" }));
    };

    const validateForm = () => {
        const errors = {};
        if (!bookingForm.name.trim()) errors.name = "Name is required";
        else if (bookingForm.name.length < VALIDATION_RULES.name.minLength) errors.name = `Name must be at least ${VALIDATION_RULES.name.minLength} characters`;
        else if (!VALIDATION_RULES.name.pattern.test(bookingForm.name)) errors.name = ERROR_MESSAGES.invalidName;

        if (!bookingForm.email.trim()) errors.email = "Email is required";
        else if (!VALIDATION_RULES.email.pattern.test(bookingForm.email)) errors.email = ERROR_MESSAGES.invalidEmail;

        if (!bookingForm.phone.trim()) errors.phone = "Phone number is required";
        else if (!VALIDATION_RULES.phone.pattern.test(bookingForm.phone)) errors.phone = ERROR_MESSAGES.invalidPhone;

        if (selectedSeats.length === 0) errors.seats = ERROR_MESSAGES.noSeatsSelected;

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const calculateTotal = () => selectedSeats.length * THEATER_CONFIG.pricePerSeat;

    // Submit
    const handleBooking = async () => {
        if (!validateForm()) return;
        setIsProcessing(true);
        try {
            let bookingData;
            if (useBackend && selectedShowtime?.id) {
                const seats = selectedSeats.map((seatId) => {
                    const row = seatId.charAt(0);
                    const number = parseInt(seatId.substring(1));
                    return {
                        seatId, row, number,
                        price: selectedShowtime.price || THEATER_CONFIG.pricePerSeat,
                    };
                });
                const bookingRequest = {
                    showtimeId: selectedShowtime.id,
                    selectedSeats: seats,
                    customerName: bookingForm.name,
                    customerEmail: bookingForm.email,
                    customerPhone: bookingForm.phone,
                };
                const created = await createBooking(bookingRequest);
                bookingData = {
                    bookingId: created._id,
                    _id: created._id,
                    movie: {
                        id: backendMovie?._id || id,
                        title: backendMovie?.title || tmdbMovie?.title,
                        poster_path: backendMovie?.pos || tmdbMovie?.posterPath,
                        runtime: backendMovie?.duration || tmdbMovie?.runtime,
                    },
                    showtime: selectedShowtime,
                    date: selectedDate,
                    seats: selectedSeats,
                    customerInfo: bookingForm,
                    total: created.totalAmount,
                    status: created.status,
                    transactionId: created.transactionId,
                    screenName: created.screenId?.name,
                    screenType: created.screenId?.screenType,
                };
            } else {
                await new Promise((r) => setTimeout(r, 1000));
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
            }
            localStorage.setItem("currentBooking", JSON.stringify(bookingData));
            navigate("/payment");
        } catch (err) {
            alert(err.message || ERROR_MESSAGES.bookingFailed);
        } finally {
            setIsProcessing(false);
        }
    };

    const displayMovie = useBackend && backendMovie ? backendMovie : tmdbMovie;

    if (loading) {
        return (
            <div className="min-h-screen bg-base-900 grid place-items-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto mb-4" />
                    <p className="text-text-muted">Loading movie details…</p>
                </div>
            </div>
        );
    }

    if (!displayMovie) {
        return (
            <div className="min-h-screen bg-base-900 grid place-items-center">
                <div className="text-center card">
                    <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-text mb-2">Movie not found</h3>
                    <p className="text-text-muted mb-4">
                        {error || "The requested movie could not be found."}
                    </p>
                    <button onClick={() => navigate("/")} className="btn-primary">Back to Movies</button>
                </div>
            </div>
        );
    }

    // Images/fields
    const posterUrl = getImageUrl(
        displayMovie?.posterPath || displayMovie?.poster_path,
        "poster",
        "large"
    );
    const movieTitle = displayMovie?.title || "Movie";
    const movieRating = displayMovie?.rating ?? displayMovie?.vote_average;
    const movieDuration = displayMovie?.duration ?? displayMovie?.runtime;
    const movieReleaseDate = displayMovie?.releaseDate ?? displayMovie?.release_date;
    const movieGenres = displayMovie?.genres || [];
    const movieOverview = displayMovie?.overview || displayMovie?.description;
    const movieLanguage =
        displayMovie?.language ||
        displayMovie?.original_language ||
        displayMovie?.originalLanguage ||
        null;
    const certification =
        displayMovie?.certification ||
        displayMovie?.ageRating ||
        displayMovie?.age_rating ||
        null;

    // Single top-genre (chip)
    const topGenre = movieGenres?.length
        ? (typeof movieGenres[0] === "string" ? movieGenres[0] : movieGenres[0]?.name)
        : null;

    return (
        <div className="min-h-screen bg-base-900">
            {/* Clean Header */}
            <div className="border-b border-surface-border/50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-4 inline-flex items-center gap-2 text-text-muted hover:text-text text-sm transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                    </button>

                    <div className="flex gap-4">
                        {/* Poster */}
                        <div className="flex-shrink-0">
                            <div className="w-20 h-28 sm:w-24 sm:h-36 overflow-hidden rounded bg-surface-light">
                                {posterUrl ? (
                                    <img
                                        src={posterUrl}
                                        alt={movieTitle}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.currentTarget.src = "/placeholder-movie-poster.jpg"; }}
                                    />
                                ) : (
                                    <div className="w-full h-full grid place-items-center text-text-dim">
                                        <Film className="w-8 h-8" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl sm:text-2xl font-semibold text-text mb-3 truncate">
                                {movieTitle}
                            </h1>

                            {/* Meta */}
                            <div className="flex flex-wrap gap-3 text-sm text-text-muted">
                                {typeof movieRating === "number" && (
                                    <span className="flex items-center gap-1">
                                        <Star className="w-3.5 h-3.5 text-cinema-gold fill-current" />
                                        {Number(movieRating).toFixed(1)}
                                    </span>
                                )}
                                {movieDuration && (
                                    <span>{movieDuration} min</span>
                                )}
                                {movieReleaseDate && (
                                    <span>{new Date(movieReleaseDate).getFullYear()}</span>
                                )}
                                {topGenre && (
                                    <span className="text-cinema-red">{topGenre}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Form */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: date/time/seats */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Date & Time */}
                        <div className="pb-6 border-b border-surface-border/50">
                            <h2 className="text-lg font-semibold text-text mb-4">Select Date & Time</h2>

                            {/* Dates */}
                            <div className="mb-6">
                                <label className="block text-xs text-text-dim mb-2">Date</label>
                                {formattedAvailableDates.length === 0 ? (
                                    <p className="text-sm text-text-muted">No showtimes available</p>
                                ) : (
                                    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2">
                                        {formattedAvailableDates.map((date) => (
                                            <button
                                                key={date.value}
                                                onClick={() => setSelectedDate(date.value)}
                                                className={`px-3 py-2 text-sm rounded transition-colors ${
                                                    selectedDate === date.value
                                                        ? "bg-cinema-red text-white"
                                                        : "bg-surface-light text-text hover:bg-surface-lighter"
                                                }`}
                                            >
                                                {date.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Showtimes */}
                            <div>
                                <label className="block text-xs text-text-dim mb-2">
                                    Showtime {useBackend && showtimesLoading && "(Loading...)"}
                                </label>

                                {useBackend && showtimes.length === 0 && !showtimesLoading ? (
                                    <p className="text-sm text-text-muted">No showtimes for this date</p>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {(useBackend ? showtimes : SHOW_TIMES.map((t) => ({ time: t }))).map((st) => {
                                            const active = selectedShowtime?.id
                                                ? selectedShowtime?.id === st.id
                                                : selectedShowtime?.time === st.time;
                                            const soldOut = useBackend ? st.availableSeats === 0 : false;

                                            return (
                                                <button
                                                    key={st.id || st.time}
                                                    onClick={() => setSelectedShowtime(st)}
                                                    disabled={soldOut}
                                                    className={`p-3 text-left rounded transition-colors ${
                                                        active
                                                            ? "bg-cinema-gold text-base-900"
                                                            : soldOut
                                                                ? "bg-surface/50 text-text-dim cursor-not-allowed opacity-50"
                                                                : "bg-surface-light text-text hover:bg-surface-lighter"
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-semibold text-sm">{st.time}</span>
                                                        {useBackend && (
                                                            <span className="text-xs">
                                                                {THEATER_CONFIG.currencySymbol}{Number(st.price || 0).toFixed(2)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {useBackend && (
                                                        <div className="flex items-center justify-between text-xs opacity-70">
                                                            <span>{st.screenName}</span>
                                                            <span>{soldOut ? "Sold Out" : `${st.availableSeats} left`}</span>
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Seats */}
                        <div>
                            <h3 className="text-lg font-semibold text-text mb-4">Select Seats</h3>
                            {formErrors.seats && (
                                <div className="mb-4 p-3 rounded bg-danger/10 text-danger text-sm flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <span>{formErrors.seats}</span>
                                </div>
                            )}
                            <SeatGrid
                                selectedSeats={selectedSeats}
                                onSeatSelect={handleSeatSelect}
                                occupiedSeats={occupiedSeats}
                            />
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Customer info */}
                        <div className="pb-6 border-b border-surface-border/50">
                            <h3 className="text-lg font-semibold text-text mb-4">Contact Details</h3>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-xs text-text-dim mb-1">Full Name</label>
                                    <input
                                        type="text" id="name" name="name"
                                        value={bookingForm.name} onChange={handleInputChange}
                                        className={`input-field ${formErrors.name ? "border-danger" : ""}`}
                                        placeholder="Your name"
                                    />
                                    {formErrors.name && <p className="mt-1 text-xs text-danger">{formErrors.name}</p>}
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-xs text-text-dim mb-1">Email</label>
                                    <input
                                        type="email" id="email" name="email"
                                        value={bookingForm.email} onChange={handleInputChange}
                                        className={`input-field ${formErrors.email ? "border-danger" : ""}`}
                                        placeholder="your@email.com"
                                    />
                                    {formErrors.email && <p className="mt-1 text-xs text-danger">{formErrors.email}</p>}
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-xs text-text-dim mb-1">Phone</label>
                                    <input
                                        type="tel" id="phone" name="phone"
                                        value={bookingForm.phone} onChange={handleInputChange}
                                        className={`input-field ${formErrors.phone ? "border-danger" : ""}`}
                                        placeholder="Phone number"
                                    />
                                    {formErrors.phone && <p className="mt-1 text-xs text-danger">{formErrors.phone}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="lg:sticky lg:top-4">
                            <h3 className="text-lg font-semibold text-text mb-4">Summary</h3>

                            <div className="space-y-3 text-sm mb-6">
                                <div className="flex justify-between">
                                    <span className="text-text-muted">Movie</span>
                                    <span className="text-text font-medium text-right max-w-[60%] truncate">{movieTitle}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-muted">Date</span>
                                    <span className="text-text">
                                        {new Date(selectedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-muted">Time</span>
                                    <span className="text-text">{selectedShowtime?.time || "—"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-muted">Seats</span>
                                    <span className="text-text">{selectedSeats.length ? selectedSeats.join(", ") : "—"}</span>
                                </div>

                                <div className="pt-3 border-t border-surface-border/50"></div>

                                <div className="flex justify-between items-baseline">
                                    <span className="text-text font-semibold">Total</span>
                                    <span className="text-text text-2xl font-semibold">
                                        {THEATER_CONFIG.currencySymbol}{calculateTotal().toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleBooking}
                                disabled={isProcessing || selectedSeats.length === 0}
                                className="w-full btn-primary disabled:opacity-50"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                                        Processing
                                    </>
                                ) : (
                                    "Proceed to Payment"
                                )}
                            </button>

                            <p className="text-xs text-text-dim mt-3 text-center">By proceeding, you agree to our terms</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Booking;
