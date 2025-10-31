// Backend API integration for movie booking
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// ============================================================================
// MOVIE APIs
// ============================================================================

/**
 * Get all movies with optional filters
 * @param {Object} params - Query parameters (status, genre, search, page, limit)
 * @returns {Promise<Object>} Movies data with pagination
 */
export const fetchMoviesFromBackend = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (params.status) queryParams.append('status', params.status);
    if (params.genre) queryParams.append('genre', params.genre);
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/movies?${queryString}` : '/movies';

    const response = await apiRequest(endpoint);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch movies from backend:', error);
    throw error;
  }
};

/**
 * Get single movie by ID
 * @param {string} movieId - Movie ID
 * @returns {Promise<Object>} Movie details
 */
export const fetchMovieById = async (movieId) => {
  try {
    const response = await apiRequest(`/movies/${movieId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch movie ${movieId}:`, error);
    throw error;
  }
};

/**
 * Get showtimes for a specific movie
 * @param {string} movieId - Movie ID
 * @param {string} date - Optional date filter (YYYY-MM-DD)
 * @returns {Promise<Object>} Showtimes data
 */
export const fetchMovieShowtimes = async (movieId, date = null) => {
  try {
    const endpoint = date
      ? `/movies/${movieId}/showtimes?date=${date}`
      : `/movies/${movieId}/showtimes`;

    const response = await apiRequest(endpoint);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch movie showtimes:', error);
    throw error;
  }
};

// ============================================================================
// BOOKING APIs
// ============================================================================

/**
 * Get occupied seats for a specific showtime
 * @param {string} movieId - Movie ID
 * @param {string} date - Date (YYYY-MM-DD)
 * @param {string} showtimeId - Optional showtime ID
 * @returns {Promise<Array>} Array of occupied seat IDs
 */
export const fetchOccupiedSeats = async (movieId, date, showtimeId = null) => {
  try {
    const params = new URLSearchParams({ movieId, date });
    if (showtimeId) params.append('showtimeId', showtimeId);

    const response = await apiRequest(`/bookings/occupied-seats?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch occupied seats:', error);
    return []; // Return empty array on error
  }
};

/**
 * Create a new booking (locks seats for 10 minutes)
 * @param {Object} bookingData - Booking details
 * @returns {Promise<Object>} Created booking
 */
export const createBooking = async (bookingData) => {
  try {
    const response = await apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create booking:', error);
    throw error;
  }
};

/**
 * Confirm booking after payment
 * @param {string} bookingId - Booking ID
 * @param {string} transactionId - Payment transaction ID
 * @returns {Promise<Object>} Confirmed booking
 */
export const confirmBooking = async (bookingId, transactionId) => {
  try {
    const response = await apiRequest(`/bookings/${bookingId}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ transactionId }),
    });
    return response.data;
  } catch (error) {
    console.error('Failed to confirm booking:', error);
    throw error;
  }
};

/**
 * Cancel a booking
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object>} Cancelled booking response
 */
export const cancelBooking = async (bookingId) => {
  try {
    const response = await apiRequest(`/bookings/${bookingId}/cancel`, {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.error('Failed to cancel booking:', error);
    throw error;
  }
};

/**
 * Get booking by ID
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object>} Booking details
 */
export const fetchBookingById = async (bookingId) => {
  try {
    const response = await apiRequest(`/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch booking:', error);
    throw error;
  }
};

/**
 * Get all bookings with filters
 * @param {Object} params - Query parameters (status, email, page, limit)
 * @returns {Promise<Array>} Array of bookings
 */
export const fetchAllBookings = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (params.status) queryParams.append('status', params.status);
    if (params.email) queryParams.append('email', params.email);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/bookings/all?${queryString}` : '/bookings/all';

    const response = await apiRequest(endpoint);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    throw error;
  }
};

// ============================================================================
// SCREEN APIs
// ============================================================================

/**
 * Get all screens
 * @returns {Promise<Array>} Array of screens
 */
export const fetchScreens = async () => {
  try {
    const response = await apiRequest('/screens');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch screens:', error);
    throw error;
  }
};

/**
 * Get screen by ID
 * @param {string} screenId - Screen ID
 * @returns {Promise<Object>} Screen details
 */
export const fetchScreenById = async (screenId) => {
  try {
    const response = await apiRequest(`/screens/${screenId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch screen:', error);
    throw error;
  }
};

// ============================================================================
// DATA FORMATTING
// ============================================================================

/**
 * Format backend movie data for frontend use
 * @param {Object} movie - Raw movie data from backend
 * @returns {Object} Formatted movie data
 */
export const formatBackendMovie = (movie) => {
  return {
    id: movie._id,
    title: movie.title,
    overview: movie.description,
    posterPath: movie.posterPath,
    backdropPath: movie.backdropPath,
    releaseDate: movie.releaseDate,
    rating: movie.rating,
    voteCount: 0,
    genres: movie.genres || [],
    genreIds: [],
    duration: movie.duration,
    language: movie.language,
    status: movie.status,
    showtimes: movie.showtimes || [],
  };
};

/**
 * Format showtime data
 * @param {Object} showtime - Raw showtime from backend
 * @returns {Object} Formatted showtime
 */
export const formatShowtime = (showtime) => {
  return {
    id: showtime._id,
    time: showtime.time,
    date: new Date(showtime.date),
    screenId: showtime.screenId,
    screenName: showtime.screenId?.name || 'Unknown',
    screenType: showtime.screenId?.screenType || 'Standard',
    availableSeats: showtime.availableSeats,
    price: showtime.price,
  };
};

/**
 * Check if backend is available
 * @returns {Promise<boolean>} True if backend is reachable
 */
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(API_BASE_URL.replace('/api', ''));
    return response.ok;
  } catch (error) {
    console.warn('Backend is not available:', error);
    return false;
  }
};

export default {
  fetchMoviesFromBackend,
  fetchMovieById,
  fetchMovieShowtimes,
  fetchOccupiedSeats,
  createBooking,
  confirmBooking,
  cancelBooking,
  fetchBookingById,
  fetchAllBookings,
  fetchScreens,
  fetchScreenById,
  formatBackendMovie,
  formatShowtime,
  checkBackendHealth,
};
