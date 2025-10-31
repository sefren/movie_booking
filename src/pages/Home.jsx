import React, { useState, useEffect } from "react";
import MovieCard from "../components/MovieCard";
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import { Loader2, Film, AlertCircle, Sparkles } from "lucide-react";
import {
  fetchNowPlayingMovies,
  fetchUpcomingMovies,
  searchMovies,
  filterMoviesByGenre,
  formatMovieData,
} from "../utils/api";
import {
  fetchMoviesFromBackend,
  formatBackendMovie,
  checkBackendHealth,
} from "../utils/backendApi";
import { useDebounce } from "../hooks/useDebounce";
import { API_CONFIG } from "../utils/constants";

const Home = ({ searchQuery: externalSearchQuery, onSearchChange }) => {
  // State
  const [activeTab, setActiveTab] = useState("now_playing"); // "now_playing" or "upcoming"
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState(null);
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [hasMoreUpcoming, setHasMoreUpcoming] = useState(true);
  const [useBackend, setUseBackend] = useState(true);

  // Debounce search query
  const debouncedSearchQuery = useDebounce(
    searchQuery,
    API_CONFIG.debounceDelay,
  );

  // Sync external search query
  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  // Check backend availability on mount
  useEffect(() => {
    const checkBackend = async () => {
      const isAvailable = await checkBackendHealth();
      setUseBackend(isAvailable);
      if (isAvailable) {
        console.log(" Using backend API for movies");
      } else {
        console.log(" Backend unavailable, using TMDB/mock data");
      }
    };
    checkBackend();
  }, []);

  // Fetch movies based on active tab
  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      setError(null);

      try {
        let result;
        let formattedMovies;

        if (useBackend) {
          // Use backend API
          const params = {
            status: activeTab,
            search: debouncedSearchQuery.trim() || undefined,
            page: activeTab === "upcoming" ? upcomingPage : 1,
            limit: 20,
          };

          const backendMovies = await fetchMoviesFromBackend(params);

          if (Array.isArray(backendMovies)) {
            formattedMovies = backendMovies.map(formatBackendMovie);
          } else {
            formattedMovies = [];
          }

          setHasMoreUpcoming(false); // Backend handles all pagination
        } else {
          // Fallback to TMDB/mock data
          if (debouncedSearchQuery.trim()) {
            result = await searchMovies(debouncedSearchQuery);
          } else if (activeTab === "now_playing") {
            result = await fetchNowPlayingMovies();
          } else {
            result = await fetchUpcomingMovies(upcomingPage);
            setHasMoreUpcoming(result.total_pages > upcomingPage);
          }

          formattedMovies = result.results.map(formatMovieData);
        }

        setMovies(formattedMovies);
        setFilteredMovies(formattedMovies);
      } catch (err) {
        console.error("Failed to load movies:", err);
        setError(err.message || "Failed to load movies. Please try again.");

        // If backend fails, try fallback
        if (useBackend) {
          console.log("Backend failed, switching to fallback...");
          setUseBackend(false);
        }
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, [activeTab, debouncedSearchQuery, upcomingPage, useBackend]);

  // Apply genre filter (client-side filtering)
  useEffect(() => {
    if (activeGenre) {
      const filtered = filterMoviesByGenre(movies, activeGenre);
      setFilteredMovies(filtered);
    } else {
      setFilteredMovies(movies);
    }
  }, [activeGenre, movies]);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setUpcomingPage(1);
    if (onSearchChange) {
      onSearchChange(query);
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery("");
    setActiveGenre(null);
    setUpcomingPage(1);
    if (onSearchChange) {
      onSearchChange("");
    }
  };

  // Handle genre filter
  const handleGenreChange = (genreId) => {
    setActiveGenre(genreId);
  };

  // Handle load more for upcoming
  const handleLoadMore = () => {
    if (hasMoreUpcoming && !loading) {
      setUpcomingPage((prev) => prev + 1);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setActiveGenre(null);
    if (onSearchChange) {
      onSearchChange("");
    }
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <div
          key={index}
          className="bg-white border border-primary-100 overflow-hidden"
        >
          <div className="aspect-[2/3] bg-primary-100 loading-shimmer"></div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-primary-100 loading-shimmer"></div>
            <div className="h-3 bg-primary-100 loading-shimmer w-3/4"></div>
            <div className="h-3 bg-primary-100 loading-shimmer w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Error state
  const ErrorState = () => (
    <div className="text-center py-12">
      <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-primary-900 mb-2">
        Something went wrong
      </h3>
      <p className="text-primary-600 mb-4">{error}</p>
      <button
        onClick={() => {
          setError(null);
          window.location.reload();
        }}
        className="btn-primary"
      >
        Try Again
      </button>
    </div>
  );

  // Empty state
  const EmptyState = () => (
    <div className="text-center py-12">
      <Film className="mx-auto h-12 w-12 text-primary-400 mb-4" />
      <h3 className="text-lg font-medium text-primary-900 mb-2">
        No movies found
      </h3>
      <p className="text-primary-600 mb-4">
        {debouncedSearchQuery
          ? `No results for "${debouncedSearchQuery}"`
          : activeGenre
            ? "No movies in this genre"
            : "No movies available at the moment"}
      </p>
      {(debouncedSearchQuery || activeGenre) && (
        <button onClick={clearFilters} className="btn-secondary">
          Clear Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-primary-50 border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-primary-900 mr-2" />
              <h1 className="text-4xl font-bold text-primary-900">Cinema</h1>
            </div>
            <p className="text-xl text-primary-600 max-w-2xl mx-auto">
              Book tickets for movies showing in theaters now
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex items-center justify-center mb-8 border-b border-primary-200">
          <button
            onClick={() => handleTabChange("now_playing")}
            className={`px-6 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
              activeTab === "now_playing"
                ? "text-primary-900 border-primary-900"
                : "text-primary-600 border-transparent hover:text-primary-900"
            }`}
          >
            Now Playing
          </button>
          <button
            onClick={() => handleTabChange("upcoming")}
            className={`px-6 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
              activeTab === "upcoming"
                ? "text-primary-900 border-primary-900"
                : "text-primary-600 border-transparent hover:text-primary-900"
            }`}
          >
            Coming Soon
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search movies in our theater..."
              initialValue={searchQuery}
              className="w-full"
            />
          </div>

          {/* Genre Filter - Only show when not searching */}
          {!debouncedSearchQuery && (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-primary-700">
                  Filter by Genre
                </label>
                {activeGenre && (
                  <button
                    onClick={() => setActiveGenre(null)}
                    className="text-xs text-primary-600 hover:text-primary-900"
                  >
                    Clear filter
                  </button>
                )}
              </div>
              <FilterBar
                activeCategory={activeTab}
                onCategoryChange={() => {}}
                activeGenre={activeGenre}
                onGenreChange={handleGenreChange}
              />
            </div>
          )}
        </div>

        {/* Results Header */}
        {!loading && filteredMovies.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-primary-900">
                {debouncedSearchQuery
                  ? `Search Results`
                  : activeGenre
                    ? "Filtered Movies"
                    : activeTab === "now_playing"
                      ? "Now Playing - Book Your Tickets"
                      : "Coming Soon - Pre-Book Tickets"}
              </h2>
              <p className="text-primary-600 mt-1">
                {filteredMovies.length}{" "}
                {filteredMovies.length === 1 ? "movie" : "movies"}{" "}
                {debouncedSearchQuery && `for "${debouncedSearchQuery}"`}
              </p>
            </div>

            {/* Clear filters button */}
            {(debouncedSearchQuery || activeGenre) && (
              <button onClick={clearFilters} className="btn-secondary text-sm">
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Content */}
        {loading && movies.length === 0 ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState />
        ) : filteredMovies.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Movies Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {filteredMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {/* Load More Button for Upcoming */}
            {activeTab === "upcoming" &&
              hasMoreUpcoming &&
              !debouncedSearchQuery &&
              !activeGenre && (
                <div className="text-center mt-8">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="btn-primary disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="inline w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More Movies"
                    )}
                  </button>
                </div>
              )}
          </>
        )}

        {/* Info Banner */}
        {!loading && !error && (
          <div className="mt-12 p-6 bg-primary-50 border border-primary-200 text-center">
            <p className="text-sm text-primary-700">
              {activeTab === "now_playing"
                ? " These movies are currently showing in theaters. Select showtimes and book your seats!"
                : " Upcoming releases - Pre-book your tickets before they hit theaters!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
