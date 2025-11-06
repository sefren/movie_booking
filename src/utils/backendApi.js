// Backend API integration for movie booking
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || `HTTP error! status: ${response.status}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
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

    if (params.status) queryParams.append("status", params.status);
    if (params.genre) queryParams.append("genre", params.genre);
    if (params.search) queryParams.append("search", params.search);
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/movies?${queryString}` : "/movies";

    const response = await apiRequest(endpoint);

    console.log('🔍 Backend Response:', response);

    // Backend returns { success: true, data: { movies: [...], pagination: {...} } }
    // Return the full data object with movies and pagination
    if (response.data) {
      const result = {
        movies: response.data.movies || [],
        totalPages: response.data.pagination?.totalPages || 1,
        total: response.data.pagination?.totalMovies || 0,
        currentPage: response.data.pagination?.currentPage || 1,
      };
      console.log('✅ Extracted Pagination Data:', {
        totalPages: result.totalPages,
        total: result.total,
        currentPage: result.currentPage,
        moviesCount: result.movies.length
      });
      return result;
    }

    // Fallback to just movies if structure is different
    console.warn('⚠️ No data object in response, using fallback');
    return { movies: [], totalPages: 1, total: 0, currentPage: 1 };
  } catch (error) {
    console.error("Failed to fetch movies from backend:", error);
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

    // Backend returns { success: true, data: { showtimes: [...], groupedByDate: {...}, count: N } }
    // Return the data object which contains showtimes array
    return response.data || { showtimes: [], groupedByDate: {}, count: 0 };
  } catch (error) {
    console.error("Failed to fetch movie showtimes:", error);
    throw error;
  }
};

/**
 * Get available dates with showtimes for a movie
 * @param {string} movieId - Movie ID
 * @returns {Promise<Array>} Array of dates that have showtimes
 */
export const fetchAvailableDates = async (movieId) => {
  try {
    // Fetch all showtimes without date filter
    const response = await apiRequest(`/movies/${movieId}/showtimes`);
    const data = response.data || { showtimes: [], groupedByDate: {}, count: 0 };

    // If no showtimes, return empty array
    if (!data.showtimes || data.showtimes.length === 0 || data.count === 0) {
      console.log('⚠️ No showtimes available for this movie');
      return [];
    }

    // Extract unique dates directly from showtimes array (no need to verify again!)
    const uniqueDates = [...new Set(
      data.showtimes.map(st => new Date(st.date).toISOString().split('T')[0])
    )].sort();

    console.log(`✅ Found ${uniqueDates.length} dates with showtimes`);
    return uniqueDates;
  } catch (error) {
    console.error("Failed to fetch available dates:", error);
    return [];
  }
};

// ============================================================================
// AUTH APIs
// ============================================================================

/**
 * Register new user
 * @param {Object} userData - User registration data (name, email, password, phone)
 * @returns {Promise<Object>} User data and token
 */
export const register = async (userData) => {
  try {
    const response = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    // Store token in localStorage
    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    console.error("Registration failed:", error);
    throw error;
  }
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User data and token
 */
export const login = async (email, password) => {
  try {
    const response = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // Store token in localStorage
    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

/**
 * Get current user profile
 * @returns {Promise<Object>} User profile
 */
export const getProfile = async () => {
  try {
    const response = await apiRequest("/auth/profile");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {Object} userData - Updated user data (name, phone)
 * @returns {Promise<Object>} Updated user data
 */
export const updateProfile = async (userData) => {
  try {
    const response = await apiRequest("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(userData),
    });

    // Update stored user data
    if (response.data) {
      localStorage.setItem("user", JSON.stringify(response.data));
    }

    return response.data;
  } catch (error) {
    console.error("Failed to update profile:", error);
    throw error;
  }
};

/**
 * Change password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Success message
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await apiRequest("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return response;
  } catch (error) {
    console.error("Failed to change password:", error);
    throw error;
  }
};

/**
 * Get user favorites
 * @returns {Promise<Array>} Array of favorite movies
 */
export const getFavorites = async () => {
  try {
    const response = await apiRequest("/auth/favorites");
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch favorites:", error.message);
    throw error;
  }
};

/**
 * Add movie to favorites
 * @param {string} movieId - Movie ID
 * @returns {Promise<Object>} Updated favorites
 */
export const addFavorite = async (movieId) => {
  try {
    const response = await apiRequest(`/auth/favorites/${movieId}`, {
      method: "POST",
    });
    return response.data;
  } catch (error) {
    console.error("Failed to add favorite:", error);
    throw error;
  }
};

/**
 * Remove movie from favorites
 * @param {string} movieId - Movie ID
 * @returns {Promise<Object>} Updated favorites
 */
export const removeFavorite = async (movieId) => {
  try {
    const response = await apiRequest(`/auth/favorites/${movieId}`, {
      method: "DELETE",
    });
    return response.data;
  } catch (error) {
    console.error("Failed to remove favorite:", error);
    throw error;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid token
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

/**
 * Get current user from localStorage
 * @returns {Object|null} User object or null
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      return null;
    }
  }
  return null;
};

// ============================================================================
// BOOKING APIs
// ============================================================================

/**
 * Get occupied seats for a specific showtime
 * @param {string} movieId - Movie ID
 * @param {string} date - Date (YYYY-MM-DD)
 * @param {Object} showtime - Showtime object with id property
 * @returns {Promise<Array>} Array of occupied seat IDs
 */
export const fetchOccupiedSeats = async (movieId, date, showtime = null) => {
  try {
    if (!showtime || !showtime.id) {
      console.warn('No showtime ID provided for occupied seats');
      return [];
    }

    const params = new URLSearchParams({ showtimeId: showtime.id });

    const response = await apiRequest(
      `/bookings/occupied-seats?${params.toString()}`,
    );
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch occupied seats:", error);
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
    const response = await apiRequest("/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
    return response.data;
  } catch (error) {
    console.error("Failed to create booking:", error);
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
      method: "POST",
      body: JSON.stringify({ transactionId }),
    });
    return response.data;
  } catch (error) {
    console.error("Failed to confirm booking:", error);
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
      method: "POST",
    });
    return response;
  } catch (error) {
    console.error("Failed to cancel booking:", error);
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
    console.error("Failed to fetch booking:", error);
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

    if (params.status) queryParams.append("status", params.status);
    if (params.email) queryParams.append("email", params.email);
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/bookings/admin/all?${queryString}`
      : "/bookings/admin/all";

    const response = await apiRequest(endpoint);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
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
    const response = await apiRequest("/screens");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch screens:", error);
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
    console.error("Failed to fetch screen:", error);
    throw error;
  }
};

// ============================================================================
// DATA FORMATTING
// ============================================================================

// Genre name to ID mapping (based on TMDB genre IDs)
const GENRE_NAME_TO_ID = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Family: 10751,
  Fantasy: 14,
  History: 36,
  Horror: 27,
  Music: 10402,
  Mystery: 9648,
  Romance: 10749,
  "Science Fiction": 878,
  "Sci-Fi": 878,
  "TV Movie": 10770,
  Thriller: 53,
  War: 10752,
  Western: 37,
};

/**
 * Format backend movie data for frontend use
 * @param {Object} movie - Raw movie data from backend
 * @returns {Object} Formatted movie data
 */
export const formatBackendMovie = (movie) => {
  const genreIds = (movie.genres || [])
    .map((genreName) => GENRE_NAME_TO_ID[genreName])
    .filter(Boolean);

  // Extract YouTube video ID from trailerUrl if it exists
  let youtubeKey = null;
  if (movie.trailerUrl) {
    // Handle both embed URLs and watch URLs
    const embedMatch = movie.trailerUrl.match(/embed\/([^"&?\/\s]{11})/);
    const watchMatch = movie.trailerUrl.match(/[?&]v=([^"&?\/\s]{11})/);
    const shortMatch = movie.trailerUrl.match(/youtu\.be\/([^"&?\/\s]{11})/);

    if (embedMatch && embedMatch[1]) {
      youtubeKey = embedMatch[1];
    } else if (watchMatch && watchMatch[1]) {
      youtubeKey = watchMatch[1];
    } else if (shortMatch && shortMatch[1]) {
      youtubeKey = shortMatch[1];
    }
  }

  return {
    id: movie._id,
    title: movie.title,
    overview: movie.description,
    posterPath: movie.posterUrl,
    backdropPath: movie.backdropUrl,
    releaseDate: movie.releaseDate,
    rating: movie.rating,
    vote_average: movie.rating,
    voteCount: 0,
    vote_count: 0,
    genres: movie.genres || [],
    genreIds: genreIds,
    duration: movie.duration,
    runtime: movie.duration,
    language: movie.originalLanguage || movie.language,
    original_language: movie.originalLanguage || movie.language,
    status: movie.status === 'now-showing' ? 'now_playing' : movie.status === 'coming-soon' ? 'upcoming' : movie.status,
    trailerUrl: movie.trailerUrl,
    youtubeKey: youtubeKey,
    cast: movie.cast || [],
    director: movie.director,
    crew: movie.director ? [{ name: movie.director, job: 'Director' }] : [],
    showtimes: movie.showtimes || [],
    ageRating: movie.ageRating,
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
    screenId: showtime.screenId?._id || showtime.screenId,
    screenName: showtime.screenId?.name || "Unknown",
    screenType: showtime.screenId?.screenType || "Standard",
    priceMultiplier: showtime.screenId?.priceMultiplier || 1.0,
    totalSeats: showtime.screenId?.totalSeats || 0,
    availableSeats: showtime.availableSeats,
    price: showtime.price,
    // Add formatted display strings
    displayTime: showtime.time,
    displayDate: new Date(showtime.date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }),
    displayScreen: `${showtime.screenId?.name || 'Screen'} (${showtime.screenId?.screenType || 'Standard'})`,
    displayPrice: `$${showtime.price?.toFixed(2) || '0.00'}`,
  };
};

/**
 * Get similar movies based on genres
 * @param {string} movieId - Current movie ID
 * @param {Array<string>} genres - Array of genre names
 * @param {number} limit - Number of similar movies to fetch
 * @returns {Promise<Array>} Array of similar movies
 */
export const fetchSimilarMoviesByGenre = async (movieId, genres, limit = 12) => {
  try {
    if (!genres || genres.length === 0) {
      return [];
    }

    // Fetch movies with matching genres
    const allMovies = await fetchMoviesFromBackend({ limit: 100 });

    // Filter out current movie and find movies with matching genres
    const similarMovies = allMovies
      .filter(movie => movie._id !== movieId)
      .map(movie => {
        // Count how many genres match
        const matchingGenres = movie.genres?.filter(g => genres.includes(g)).length || 0;
        return { ...movie, matchScore: matchingGenres };
      })
      .filter(movie => movie.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit)
      .map(formatBackendMovie);

    return similarMovies;
  } catch (error) {
    console.error('Failed to fetch similar movies:', error);
    return [];
  }
};

/**
 * Group similar movies by genre
 * @param {string} movieId - Current movie ID
 * @param {Array<string>} genres - Array of genre names (top 3)
 * @returns {Promise<Object>} Object with genres as keys and movie arrays as values
 */
export const fetchSimilarMoviesByGenreGroups = async (movieId, genres) => {
  try {
    const topGenres = genres.slice(0, 3); // Take top 3 genres
    const response = await fetchMoviesFromBackend({ limit: 100 });
    const allMovies = response.movies || []; // Extract movies array from response
    const genreGroups = {};

    for (const genre of topGenres) {
      const moviesInGenre = allMovies
        .filter(movie =>
          movie._id !== movieId &&
          movie.genres?.includes(genre)
        )
        .slice(0, 6)
        .map(formatBackendMovie);

      if (moviesInGenre.length > 0) {
        genreGroups[genre] = moviesInGenre;
      }
    }

    return genreGroups;
  } catch (error) {
    console.error('Failed to fetch similar movies by genre groups:', error);
    return {};
  }
};

/**
 * Check if backend is available
 * @returns {Promise<boolean>} True if backend is reachable
 */
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(API_BASE_URL.replace("/api", ""));
    return response.ok;
  } catch (error) {
    console.warn("Backend is not available:", error);
    return false;
  }
};

export default {
  // Auth
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  getFavorites,
  addFavorite,
  removeFavorite,
  isAuthenticated,
  getCurrentUser,
  // Movies
  fetchMoviesFromBackend,
  fetchMovieById,
  fetchMovieShowtimes,
  fetchAvailableDates,
  // Bookings
  fetchOccupiedSeats,
  createBooking,
  confirmBooking,
  cancelBooking,
  fetchBookingById,
  fetchAllBookings,
  // Screens
  fetchScreens,
  fetchScreenById,
  // Formatting
  formatBackendMovie,
  formatShowtime,
  fetchSimilarMoviesByGenre,
  fetchSimilarMoviesByGenreGroups,
  // Health
  checkBackendHealth,
};
