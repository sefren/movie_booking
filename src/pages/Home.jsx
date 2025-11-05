import React, { useState, useEffect, useCallback } from "react";
import MovieCard from "../components/MovieCard";
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import {
  Loader2,
  Film,
  AlertCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Play,
  Star,
  Clock,
  Calendar,
  Info,
} from "lucide-react";
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
import { useNavigate } from "react-router-dom";

const Home = () => {
  // State
  const [activeTab, setActiveTab] = useState("now_playing");
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState(null);
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [hasMoreUpcoming, setHasMoreUpcoming] = useState(true);
  const [useBackend, setUseBackend] = useState(true);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const navigate = useNavigate();

  // Debounce search query
  const debouncedSearchQuery = useDebounce(
    searchQuery,
    API_CONFIG.debounceDelay,
  );

  // Hero carousel auto-play
  useEffect(() => {
    if (movies.length > 0) {
      const interval = setInterval(() => {
        setCurrentHeroSlide((prev) => (prev + 1) % Math.min(5, movies.length));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [movies.length]);

  // Check backend availability on mount
  useEffect(() => {
    const checkBackend = async () => {
      const isAvailable = await checkBackendHealth();
      setUseBackend(isAvailable);
      if (isAvailable) {
        console.log("✓ Using backend API for movies");
      } else {
        console.log("✗ Backend unavailable, using TMDB/mock data");
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
          // Map frontend tab names to backend status values
          const statusMap = {
            'now_playing': 'now-showing',
            'upcoming': 'coming-soon'
          };

          const params = {
            status: statusMap[activeTab] || activeTab,
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

          setHasMoreUpcoming(false);
        } else {
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

  // Apply genre filter
  useEffect(() => {
    if (activeGenre) {
      const filtered = filterMoviesByGenre(movies, activeGenre);
      setFilteredMovies(filtered);
    } else {
      setFilteredMovies(movies);
    }
  }, [activeGenre, movies]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setUpcomingPage(1);
  }, []);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setSearchQuery("");
    setActiveGenre(null);
    setUpcomingPage(1);
    setCurrentHeroSlide(0);
  }, []);

  const handleGenreChange = useCallback((genreId) => {
    setActiveGenre(genreId);
  }, []);

  const handleLoadMore = () => {
    if (hasMoreUpcoming && !loading) {
      setUpcomingPage((prev) => prev + 1);
    }
  };

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setActiveGenre(null);
  }, []);

  const nextSlide = () => {
    setCurrentHeroSlide((prev) => (prev + 1) % Math.min(5, movies.length));
  };

  const prevSlide = () => {
    setCurrentHeroSlide(
      (prev) =>
        (prev - 1 + Math.min(5, movies.length)) % Math.min(5, movies.length),
    );
  };

  const goToSlide = (index) => {
    setCurrentHeroSlide(index);
  };

  const handleBookNow = (movieId) => {
    navigate(`/booking/${movieId}`);
  };

  // Hero Section Component
  const HeroSection = () => {
    const heroMovies = movies.slice(0, 5);

    if (loading || heroMovies.length === 0) {
      return (
        <div className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] bg-primary-900 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
        </div>
      );
    }

    const currentMovie = heroMovies[currentHeroSlide];
    const backdropUrl = currentMovie.backdropPath
      ? `https://image.tmdb.org/t/p/original${currentMovie.backdropPath}`
      : currentMovie.posterPath
        ? `https://image.tmdb.org/t/p/original${currentMovie.posterPath}`
        : "/placeholder-backdrop.jpg";

    return (
      <div className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] bg-primary-900 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src={backdropUrl}
            alt={currentMovie.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "/placeholder-backdrop.jpg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-center h-full max-w-2xl">
            {/* Badge */}
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-primary-900/80 backdrop-blur-sm text-white text-xs sm:text-sm font-semibold rounded-full border border-white/20">
                {activeTab === "now_playing" ? "NOW PLAYING" : "COMING SOON"}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              {currentMovie.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6 text-white/90">
              {currentMovie.vote_average && (
                <div className="flex items-center space-x-1.5">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                  <span className="text-sm sm:text-base font-semibold">
                    {currentMovie.vote_average.toFixed(1)}
                  </span>
                </div>
              )}
              {currentMovie.release_date && (
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">
                    {new Date(currentMovie.release_date).getFullYear()}
                  </span>
                </div>
              )}

              {Array.isArray(currentMovie.genres) &&
                currentMovie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {currentMovie.genres.slice(0, 3).map((genre, idx) => {
                      // Handle both string and object genres safely
                      const genreName =
                        typeof genre === "object" && genre !== null
                          ? genre.name || JSON.stringify(genre)
                          : String(genre);

                      return (
                        <span
                          key={idx}
                          className="text-xs sm:text-sm px-2 py-0.5 bg-white/20 rounded backdrop-blur-sm"
                        >
                          {genreName}
                        </span>
                      );
                    })}
                  </div>
                )}
            </div>

            {/* Overview */}
            {currentMovie.overview && (
              <p className="text-sm sm:text-base md:text-lg text-white/90 mb-6 sm:mb-8 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                {currentMovie.overview}
              </p>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => handleBookNow(currentMovie.id)}
                className="flex items-center justify-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-primary-900 hover:bg-primary-800 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                <span className="text-sm sm:text-base">Book Tickets</span>
              </button>

              <button
                onClick={() => navigate(`/movie/${currentMovie.id}`)}
                className="flex items-center justify-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold rounded-lg transition-all duration-300 border border-white/30"
              >
                <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">More Info</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {heroMovies.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-full transition-all duration-300 z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-full transition-all duration-300 z-10"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {heroMovies.length > 1 && (
          <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-2 sm:space-x-3 z-10">
            {heroMovies.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentHeroSlide
                    ? "w-8 sm:w-10 h-1.5 sm:h-2 bg-white"
                    : "w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <div
          key={index}
          className="bg-white border border-primary-100 rounded-lg overflow-hidden"
        >
          <div className="aspect-[2/3] bg-primary-100 animate-pulse"></div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-primary-100 animate-pulse rounded"></div>
            <div className="h-3 bg-primary-100 animate-pulse rounded w-3/4"></div>
            <div className="h-3 bg-primary-100 animate-pulse rounded w-1/2"></div>
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
        className="px-6 py-2.5 bg-primary-900 text-white rounded-lg hover:bg-primary-800 transition-colors"
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
        <button
          onClick={clearFilters}
          className="px-6 py-2.5 bg-white border-2 border-primary-900 text-primary-900 rounded-lg hover:bg-primary-50 transition-colors"
        >
          Clear Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Carousel Section */}
      <HeroSection />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        {/* Tab Navigation */}
        <div className="flex items-center justify-center mb-6 sm:mb-8 border-b border-primary-200">
          <button
            onClick={() => handleTabChange("now_playing")}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-200 border-b-2 ${
              activeTab === "now_playing"
                ? "text-primary-900 border-primary-900"
                : "text-primary-600 border-transparent hover:text-primary-900"
            }`}
          >
            Now Playing
          </button>
          <button
            onClick={() => handleTabChange("upcoming")}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-200 border-b-2 ${
              activeTab === "upcoming"
                ? "text-primary-900 border-primary-900"
                : "text-primary-600 border-transparent hover:text-primary-900"
            }`}
          >
            Coming Soon
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 sm:mb-8 space-y-4 sm:space-y-6">
          <div className="max-w-2xl mx-auto">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search movies in our theater..."
              initialValue={searchQuery}
              className="w-full"
            />
          </div>

          {!debouncedSearchQuery && (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs sm:text-sm font-medium text-primary-700">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-primary-900">
                {debouncedSearchQuery
                  ? `Search Results`
                  : activeGenre
                    ? "Filtered Movies"
                    : activeTab === "now_playing"
                      ? "Now Playing - Book Your Tickets"
                      : "Coming Soon - Pre-Book Tickets"}
              </h2>
              <p className="text-xs sm:text-sm text-primary-600 mt-1">
                {filteredMovies.length}{" "}
                {filteredMovies.length === 1 ? "movie" : "movies"}{" "}
                {debouncedSearchQuery && `for "${debouncedSearchQuery}"`}
              </p>
            </div>

            {(debouncedSearchQuery || activeGenre) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-xs sm:text-sm bg-white border-2 border-primary-900 text-primary-900 rounded-lg hover:bg-primary-50 transition-colors"
              >
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {filteredMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {activeTab === "upcoming" &&
              hasMoreUpcoming &&
              !debouncedSearchQuery &&
              !activeGenre && (
                <div className="text-center mt-8">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="px-6 py-3 bg-primary-900 text-white rounded-lg hover:bg-primary-800 disabled:opacity-50 transition-colors text-sm sm:text-base"
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
          <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-primary-50 border border-primary-200 rounded-lg text-center">
            <p className="text-xs sm:text-sm text-primary-700">
              {activeTab === "now_playing"
                ? "✨ These movies are currently showing in theaters. Select showtimes and book your seats!"
                : "🎬 Upcoming releases - Pre-book your tickets before they hit theaters!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
