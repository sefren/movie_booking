import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import MovieGrid from "../components/MovieGrid";
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import {
    Loader2,
    ChevronLeft,
    ChevronRight,
    Play,
    Star,
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
import { preloadMoviePosters } from "../utils/imageCache";
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
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalMovies, setTotalMovies] = useState(0);
    const [useBackend, setUseBackend] = useState(true);
    const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
    const [pageLoading, setPageLoading] = useState(false);
    const [heroMovies, setHeroMovies] = useState([]);
    const requestSeq = useRef(0);

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
        const seq = ++requestSeq.current;

        // If we already have something on screen, treat this as a page fetch.
        const isPageFetch = movies.length > 0;
        setLoading(!isPageFetch);
        setPageLoading(isPageFetch);
        setError(null);

        const loadMovies = async () => {
            try {
                let result;
                let formattedMovies;

                if (useBackend) {
                    const statusMap = { now_playing: "now-showing", upcoming: "coming-soon" };
                    const params = {
                        status: statusMap[activeTab] || activeTab,
                        search: debouncedSearchQuery.trim() || undefined,
                        page: currentPage,
                        limit: 20,
                    };

                    const backendResponse = await fetchMoviesFromBackend(params);

                    if (backendResponse && typeof backendResponse === "object") {
                        if (Array.isArray(backendResponse.movies)) {
                            formattedMovies = backendResponse.movies.map(formatBackendMovie);
                            if (requestSeq.current !== seq) return; // stale
                            setTotalPages(backendResponse.totalPages || 1);
                            setTotalMovies(backendResponse.total || formattedMovies.length);
                        } else if (Array.isArray(backendResponse)) {
                            formattedMovies = backendResponse.map(formatBackendMovie);
                            if (requestSeq.current !== seq) return;
                            setTotalPages(1);
                            setTotalMovies(formattedMovies.length);
                        } else {
                            formattedMovies = [];
                            if (requestSeq.current !== seq) return;
                            setTotalPages(1);
                            setTotalMovies(0);
                        }
                    } else if (Array.isArray(backendResponse)) {
                        formattedMovies = backendResponse.map(formatBackendMovie);
                        if (requestSeq.current !== seq) return;
                        setTotalPages(1);
                        setTotalMovies(formattedMovies.length);
                    } else {
                        formattedMovies = [];
                        if (requestSeq.current !== seq) return;
                        setTotalPages(1);
                        setTotalMovies(0);
                    }
                } else {
                    if (debouncedSearchQuery.trim()) {
                        result = await searchMovies(debouncedSearchQuery, currentPage);
                    } else if (activeTab === "now_playing") {
                        result = await fetchNowPlayingMovies(currentPage);
                    } else {
                        result = await fetchUpcomingMovies(currentPage);
                    }

                    formattedMovies = result.results.map(formatMovieData);
                    if (requestSeq.current !== seq) return; // stale
                    setTotalPages(result.total_pages || 1);
                    setTotalMovies(result.total_results || formattedMovies.length);
                }

                // Commit results if still the latest request
                if (requestSeq.current !== seq) return;
                setMovies(formattedMovies);
                setFilteredMovies(formattedMovies);

                // Preload next page images for faster navigation
                if (formattedMovies.length > 0) {
                    preloadMoviePosters(formattedMovies, 20);
                }

                // Only refresh hero on page 1 so it stays stable during pagination
                if (currentPage === 1) {
                    setHeroMovies(formattedMovies.slice(0, 5));
                }
            } catch (err) {
                if (requestSeq.current !== seq) return;
                console.error("Failed to load movies:", err);
                setError(err.message || "Failed to load movies. Please try again.");
                if (useBackend) setUseBackend(false);
            } finally {
                if (requestSeq.current === seq) {
                    setLoading(false);
                    setPageLoading(false);
                }
            }
        };

        loadMovies();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, debouncedSearchQuery, currentPage, useBackend]);


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
        setCurrentPage(1); // Reset to page 1 on search
    }, []);

    const handleTabChange = useCallback((tab) => {
        setActiveTab(tab);
        setSearchQuery("");
        setActiveGenre(null);
        setCurrentPage(1); // Reset to page 1 on tab change
        setCurrentHeroSlide(0);
        setMovies([]); // Clear movies when switching tabs to prevent stale index
    }, []);

    const handleGenreChange = useCallback((genreId) => {
        setActiveGenre(genreId);
        setCurrentPage(1); // Reset to page 1 on genre change
    }, []);

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
        // Scroll to top instantly on pagination
        window.scrollTo(0, 0);
    }, []);


    const clearFilters = useCallback(() => {
        setSearchQuery("");
        setActiveGenre(null);
    }, []);

    const nextSlide = () => {
        const maxSlides = Math.min(5, movies.length);
        if (maxSlides > 0) {
            setCurrentHeroSlide((prev) => (prev + 1) % maxSlides);
        }
    };

    const prevSlide = () => {
        const maxSlides = Math.min(5, movies.length);
        if (maxSlides > 0) {
            setCurrentHeroSlide(
                (prev) => (prev - 1 + maxSlides) % maxSlides,
            );
        }
    };

    const goToSlide = (index) => {
        if (index >= 0 && index < Math.min(5, movies.length)) {
            setCurrentHeroSlide(index);
        }
    };

    const handleBookNow = (movieId) => {
        navigate(`/booking/${movieId}`);
    };

    // Hero Section Component - Memoized to prevent re-renders
    const HeroSection = memo(({ movies, currentSlide, onNext, onPrev, onGoTo, onBookNow, activeTab, loading }) => {
        const heroMovies = movies.slice(0, 5);

        if (loading || heroMovies.length === 0) {
            return (
                <div className="relative h-[500px] md:h-[600px] lg:h-[700px] bg-black overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 text-cinema-red animate-spin mx-auto mb-4" />
                            <p className="text-text-muted">Loading featured movies...</p>
                        </div>
                    </div>
                </div>
            );
        }

        const currentMovie = heroMovies[currentSlide];

        // Safety check - if currentMovie is undefined, don't render
        if (!currentMovie) {
            return null;
        }

        const backdropUrl = currentMovie.backdropPath
            ? `https://image.tmdb.org/t/p/original${currentMovie.backdropPath}`
            : currentMovie.posterPath
                ? `https://image.tmdb.org/t/p/original${currentMovie.posterPath}`
                : "/placeholder-backdrop.jpg";

        return (
            <div className="relative h-[500px] sm:h-[550px] md:h-[600px] lg:h-[700px] bg-black overflow-hidden">
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
                    <div className="absolute inset-0 bg-gradient-to-r from-base-900 via-base-900/80 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-base-900 via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-b from-base-900/50 via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col justify-end sm:justify-center h-full max-w-3xl pb-20 sm:pb-0">
                        {/* Badge */}
                        <div className="mb-2 sm:mb-3">
              <span className="inline-flex items-center gap-1.5 glass px-2.5 py-1 text-[10px] sm:text-xs font-semibold rounded-full border border-cinema-red/30">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cinema-red opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cinema-red"></span>
                </span>
                  {activeTab === "now_playing" ? "NOW SHOWING" : "COMING SOON"}
              </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-text mb-2 sm:mb-4 drop-shadow-2xl leading-tight">
                            {currentMovie.title}
                        </h1>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mb-3 sm:mb-5 text-text">
                            {currentMovie.vote_average && (
                                <div className="flex items-center gap-1 glass px-2 py-1 rounded-md text-[10px] sm:text-sm">
                                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-cinema-gold fill-current" />
                                    <span className="font-semibold">
                    {currentMovie.vote_average.toFixed(1)}
                  </span>
                                </div>
                            )}
                            {currentMovie.release_date && (
                                <div className="flex items-center gap-1 glass px-2 py-1 rounded-md text-[10px] sm:text-sm">
                                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span>
                    {new Date(currentMovie.release_date).getFullYear()}
                  </span>
                                </div>
                            )}

                            {Array.isArray(currentMovie.genres) &&
                                currentMovie.genres.length > 0 && (
                                    <div className="hidden md:flex flex-wrap gap-2">
                                        {currentMovie.genres.slice(0, 2).map((genre, idx) => {
                                            const genreName =
                                                typeof genre === "object" && genre !== null
                                                    ? genre.name || JSON.stringify(genre)
                                                    : String(genre);

                                            return (
                                                <span
                                                    key={idx}
                                                    className="text-xs px-2.5 py-1 glass rounded-full border border-cinema-gold/20"
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
                            <p className="hidden md:block text-sm lg:text-base text-text-muted mb-5 sm:mb-6 line-clamp-2 leading-relaxed max-w-2xl">
                                {currentMovie.overview}
                            </p>
                        )}

                        {/* Buttons - Side by side on mobile */}
                        <div className="flex gap-2 sm:gap-3 max-w-md">
                            <button
                                onClick={() => handleBookNow(currentMovie.id)}
                                className="btn-primary flex-1 flex items-center justify-center gap-1.5 px-3 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm"
                            >
                                <Play className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                                <span>Book Now</span>
                            </button>

                            <button
                                onClick={() => navigate(`/movie/${currentMovie.id}`)}
                                className="btn-secondary flex-1 flex items-center justify-center gap-1.5 px-3 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm"
                            >
                                <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>Details</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navigation Arrows - Hidden on mobile */}
                {heroMovies.length > 1 && (
                    <>
                        <button
                            onClick={prevSlide}
                            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 p-3 glass rounded-full hover:bg-white/10 transition-all z-10 group"
                            aria-label="Previous slide"
                        >
                            <ChevronLeft className="w-6 h-6 group-hover:text-cinema-red transition-colors" />
                        </button>

                        <button
                            onClick={nextSlide}
                            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 p-3 glass rounded-full hover:bg-white/10 transition-all z-10 group"
                            aria-label="Next slide"
                        >
                            <ChevronRight className="w-6 h-6 group-hover:text-cinema-red transition-colors" />
                        </button>
                    </>
                )}

                {/* Dots Indicator */}
                {heroMovies.length > 1 && (
                    <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                        {heroMovies.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`transition-all duration-300 rounded-full ${
                                    index === currentHeroSlide
                                        ? "w-6 sm:w-8 h-1.5 bg-cinema-red shadow-glow-sm"
                                        : "w-1.5 h-1.5 bg-white/30 hover:bg-white/50"
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    });

    return (
        <div className="min-h-screen bg-base-900">
            {/* Hero Carousel Section */}
            <HeroSection
                movies={movies}
                currentSlide={currentHeroSlide}
                onNext={nextSlide}
                onPrev={prevSlide}
                onGoTo={goToSlide}
                onBookNow={handleBookNow}
                activeTab={activeTab}
                loading={loading}
            />

            {/* Main Content - Better Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
                {/* Tab Navigation - Contained Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-center gap-2 p-1 bg-white/5 rounded-lg max-w-md mx-auto">
                        <button
                            onClick={() => handleTabChange("now_playing")}
                            className={`flex-1 px-6 py-2.5 text-sm font-medium rounded-md transition-all ${
                                activeTab === "now_playing"
                                    ? "bg-cinema-red text-white shadow-lg"
                                    : "text-white/70 hover:text-white"
                            }`}
                        >
                            Now Playing
                        </button>
                        <button
                            onClick={() => handleTabChange("upcoming")}
                            className={`flex-1 px-6 py-2.5 text-sm font-medium rounded-md transition-all ${
                                activeTab === "upcoming"
                                    ? "bg-cinema-red text-white shadow-lg"
                                    : "text-white/70 hover:text-white"
                            }`}
                        >
                            Coming Soon
                        </button>
                    </div>
                </div>

                {/* Search Section - Clean Container */}
                <div className="mb-8">
                    <div className="max-w-3xl mx-auto">
                        <SearchBar
                            onSearch={handleSearch}
                            placeholder="Search for movies..."
                            initialValue={searchQuery}
                            className="w-full"
                        />
                    </div>
                </div>

                {/* Filters Section - Only show when not searching */}
                {!debouncedSearchQuery && (
                    <div className="mb-10">
                        <div className="text-center mb-4">
                            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
                                Filter by Genre
                            </h3>
                        </div>
                        <FilterBar
                            activeGenre={activeGenre}
                            onGenreChange={handleGenreChange}
                        />
                    </div>
                )}

                {/* Content Area - Optimized with MovieGrid Component */}
                <MovieGrid
                    movies={filteredMovies}
                    loading={loading && movies.length === 0}
                    pageLoading={loading && movies.length > 0}
                    error={error}
                    searchQuery={debouncedSearchQuery}
                    activeGenre={activeGenre}
                    activeTab={activeTab}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    onClearFilters={clearFilters}
                />
            </div>
        </div>
    );
};

export default Home;