// Application constants and configuration

// Theater configuration
export const THEATER_CONFIG = {
  rows: ["A", "B", "C", "D", "E", "F", "G", "H"],
  seatsPerRow: 12,
  aisleAfterSeat: 6, // Creates aisle after seat 6
  pricePerSeat: 1000, // ₹1000 per seat (approx $12.5 * 80)
  currency: "INR",
  currencySymbol: "₹",
  name: "Studio 9",
  location: "Downtown"
};

// Show times
export const SHOW_TIMES = [
  "10:00 AM",
  "01:30 PM",
  "04:00 PM",
  "07:00 PM",
  "10:30 PM",
];

// Seat status constants
export const SEAT_STATUS = {
  AVAILABLE: "available",
  SELECTED: "selected",
  OCCUPIED: "occupied",
  DISABLED: "disabled",
};

// Booking status constants
export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

// Payment status constants
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SUCCESS: "success",
  FAILED: "failed",
  CANCELLED: "cancelled",
};

// API configuration
export const API_CONFIG = {
  pagination: {
    nowPlayingPerPage: 12, // Show all now playing at once (no pagination)
    upcomingPerPage: 20, // Upcoming can have pagination
  },
  debounceDelay: 500, // milliseconds
  requestTimeout: 10000, // 10 seconds
};

// Date/Time configuration
export const DATE_CONFIG = {
  dateFormat: "MMM DD, YYYY",
  timeFormat: "h:mm A",
  timezone: "local",
};

// Validation rules
export const VALIDATION_RULES = {
  name: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/,
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  phone: {
    pattern: /^[+]?[1-9][\d]{0,15}$/,
    minLength: 10,
    maxLength: 15,
  },
  maxSeatsPerBooking: 20,
  minSeatsPerBooking: 1,
};

// UI Configuration
export const UI_CONFIG = {
  animations: {
    duration: 300, // milliseconds
    easing: "ease-in-out",
  },
  breakpoints: {
    mobile: "640px",
    tablet: "768px",
    desktop: "1024px",
    wide: "1280px",
  },
  spacing: {
    section: "4rem",
    component: "2rem",
    element: "1rem",
  },
};

// Rating configuration
export const RATING_CONFIG = {
  maxRating: 10,
  minRating: 0,
  ratingThresholds: {
    excellent: 8.5,
    good: 7.0,
    average: 5.0,
    poor: 3.0,
  },
};

// Error messages
export const ERROR_MESSAGES = {
  network: "Network error. Please check your connection and try again.",
  apiTimeout: "Request timed out. Please try again.",
  invalidData: "Invalid data received. Please refresh the page.",
  seatUnavailable: "Selected seats are no longer available.",
  maxSeatsExceeded: `You can select a maximum of ${VALIDATION_RULES.maxSeatsPerBooking} seats.`,
  noSeatsSelected: "Please select at least one seat.",
  invalidEmail: "Please enter a valid email address.",
  invalidPhone: "Please enter a valid phone number.",
  invalidName: "Name should contain only letters and spaces.",
  paymentFailed: "Payment processing failed. Please try again.",
  bookingFailed: "Booking failed. Please try again.",
  generic: "Something went wrong. Please try again.",
};

// Success messages
export const SUCCESS_MESSAGES = {
  bookingSuccess: "Your booking has been confirmed successfully!",
  paymentSuccess: "Payment processed successfully!",
  seatSelected: "Seat(s) selected successfully.",
  dataLoaded: "Data loaded successfully.",
};

// Movie categories for a theater (simplified)
export const MOVIE_CATEGORIES = [
  { id: "now_playing", name: "Now Playing", value: "now_playing" },
  { id: "upcoming", name: "Coming Soon", value: "upcoming" },
];

// Genre options for filtering
export const GENRE_OPTIONS = [
  { id: "all", name: "All Genres", value: null },
  { id: "28", name: "Action", value: 28 },
  { id: "35", name: "Comedy", value: 35 },
  { id: "18", name: "Drama", value: 18 },
  { id: "27", name: "Horror", value: 27 },
  { id: "10749", name: "Romance", value: 10749 },
  { id: "878", name: "Sci-Fi", value: 878 },
  { id: "53", name: "Thriller", value: 53 },
  { id: "16", name: "Animation", value: 16 },
  { id: "12", name: "Adventure", value: 12 },
  { id: "14", name: "Fantasy", value: 14 },
];

// Local storage keys
export const STORAGE_KEYS = {
  selectedSeats: "movie_booking_selected_seats",
  userPreferences: "movie_booking_preferences",
  bookingHistory: "movie_booking_history",
  currentBooking: "movie_booking_current",
};

// Routes
export const ROUTES = {
  home: "/",
  movies: "/movies",
  movieDetails: "/movie/:id",
  booking: "/booking/:id",
  payment: "/payment",
  confirmation: "/confirmation",
  profile: "/profile",
  history: "/history",
};

// Default values
export const DEFAULTS = {
  moviePoster: "/placeholder-movie-poster.jpg",
  userAvatar: "/placeholder-avatar.jpg",
  currency: THEATER_CONFIG.currency,
  showtime: SHOW_TIMES[0],
  category: "now_playing",
};

// Feature flags (for enabling/disabling features)
export const FEATURE_FLAGS = {
  enablePaymentIntegration: false, // Set to true when real payment is integrated
  enableUserAuthentication: false, // Set to true when auth is implemented
  enableMovieReviews: false,
  enableSeatLocking: true,
  enableBookingHistory: true,
  enableEmailNotifications: false,
};
