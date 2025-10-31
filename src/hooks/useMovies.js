import { useState, useEffect, useCallback } from "react";
import {
  searchMovies,
  fetchMovieDetails,
  fetchNowPlayingMovies,
  fetchUpcomingMovies,
  fetchMoviesWithFallback,
  formatMovieData,
} from "../utils/api";
import { API_CONFIG, ERROR_MESSAGES } from "../utils/constants";

/**
 * Custom hook for managing movies data and API calls
 */
export const useMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalResults: 0,
  });

  // Reset error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Generic fetch function
  const fetchMoviesData = useCallback(async (fetchFunction, ...args) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchMoviesWithFallback(fetchFunction, ...args);
      const formattedMovies = response.results.map(formatMovieData);

      setMovies(formattedMovies);
      setPagination({
        currentPage: response.page || 1,
        totalPages: response.total_pages || 1,
        totalResults: response.total_results || formattedMovies.length,
      });
    } catch (err) {
      setError(err.message || ERROR_MESSAGES.generic);
      setMovies([]);
      setPagination({ currentPage: 1, totalPages: 0, totalResults: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch popular movies (not available, using now playing instead)
  const fetchPopular = useCallback(
    (page = 1) => {
      return fetchMoviesData(fetchNowPlayingMovies, page);
    },
    [fetchMoviesData],
  );

  // Search movies
  const searchMoviesData = useCallback(
    (query, page = 1) => {
      if (!query.trim()) {
        setMovies([]);
        setPagination({ currentPage: 1, totalPages: 0, totalResults: 0 });
        return;
      }
      return fetchMoviesData(searchMovies, query, page);
    },
    [fetchMoviesData],
  );

  // Fetch by genre (client-side filtering)
  const fetchByGenre = useCallback(
    (genreId, page = 1) => {
      // Note: This would need client-side filtering or a custom implementation
      return fetchMoviesData(fetchNowPlayingMovies, page);
    },
    [fetchMoviesData],
  );

  // Fetch trending movies (not available, using now playing instead)
  const fetchTrending = useCallback(
    (timeWindow = "week", page = 1) => {
      return fetchMoviesData(fetchNowPlayingMovies, page);
    },
    [fetchMoviesData],
  );

  // Fetch now playing movies
  const fetchNowPlaying = useCallback(
    (page = 1) => {
      return fetchMoviesData(fetchNowPlayingMovies, page);
    },
    [fetchMoviesData],
  );

  // Fetch upcoming movies
  const fetchUpcoming = useCallback(
    (page = 1) => {
      return fetchMoviesData(fetchUpcomingMovies, page);
    },
    [fetchMoviesData],
  );

  // Fetch top rated movies (not available, using now playing instead)
  const fetchTopRated = useCallback(
    (page = 1) => {
      return fetchMoviesData(fetchNowPlayingMovies, page);
    },
    [fetchMoviesData],
  );

  return {
    movies,
    loading,
    error,
    pagination,
    fetchPopular,
    searchMovies: searchMoviesData,
    fetchByGenre,
    fetchTrending,
    fetchNowPlaying,
    fetchUpcoming,
    fetchTopRated,
    clearError,
  };
};

/**
 * Custom hook for managing single movie details
 */
export const useMovieDetails = (movieId) => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMovie = useCallback(async (id) => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const movieData = await fetchMovieDetails(id);
      setMovie(movieData);
    } catch (err) {
      setError(err.message || ERROR_MESSAGES.generic);
      setMovie(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (movieId) {
      fetchMovie(movieId);
    }
  }, [movieId, fetchMovie]);

  return {
    movie,
    loading,
    error,
    refetch: () => fetchMovie(movieId),
  };
};

/**
 * Custom hook for managing movie categories and filters
 */
export const useMovieFilters = () => {
  const [activeCategory, setActiveCategory] = useState("now_playing");
  const [activeGenre, setActiveGenre] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popularity.desc");

  const resetFilters = useCallback(() => {
    setActiveCategory("now_playing");
    setActiveGenre(null);
    setSearchQuery("");
    setSortBy("popularity.desc");
  }, []);

  return {
    activeCategory,
    setActiveCategory,
    activeGenre,
    setActiveGenre,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    resetFilters,
  };
};

export default useMovies;
