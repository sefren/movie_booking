import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, User, Menu, X, Film } from "lucide-react";
import { useDebounce } from "../hooks/useDebounce";
import { getImageUrl } from "../utils/api";
import {
  fetchMoviesFromBackend,
  formatBackendMovie,
  checkBackendHealth,
} from "../utils/backendApi";
import { searchMovies, formatMovieData } from "../utils/api";
import { API_CONFIG } from "../utils/constants";

const Header = ({ showSearch = true }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [useBackend, setUseBackend] = useState(true);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const debouncedSearchQuery = useDebounce(
    searchQuery,
    API_CONFIG.debounceDelay,
  );

  useEffect(() => {
    const checkBackend = async () => {
      const isAvailable = await checkBackendHealth();
      setUseBackend(isAvailable);
    };
    checkBackend();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchQuery.trim()) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      setIsSearching(true);
      setShowDropdown(true);

      try {
        let results = [];

        if (useBackend) {
          const params = {
            search: debouncedSearchQuery.trim(),
            limit: 5,
          };
          const backendMovies = await fetchMoviesFromBackend(params);
          results = Array.isArray(backendMovies)
            ? backendMovies.map(formatBackendMovie)
            : [];
        } else {
          const response = await searchMovies(debouncedSearchQuery);
          results = response.results.slice(0, 5).map(formatMovieData);
        }

        setSearchResults(results);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery, useBackend]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleMovieClick = (movieId) => {
    setShowDropdown(false);
    setSearchQuery("");
    setSearchResults([]);
    navigate(`/movie/${movieId}`);
  };

  return (
    <header className="bg-white border-b border-primary-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-1">
            <Link to="/" className="flex items-center">
              <div className="text-xl font-semibold text-primary-900 tracking-tight">
                Cinema
              </div>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          {showSearch && (
            <div
              className="hidden md:block flex-1 max-w-md mx-8"
              ref={searchRef}
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-primary-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => searchQuery && setShowDropdown(true)}
                  className="block w-full pl-10 pr-10 py-2 border border-primary-200 bg-white text-primary-900 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary-400 hover:text-primary-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                {/* Search Results Dropdown */}
                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-primary-200 shadow-lg max-h-96 overflow-y-auto z-50">
                    {isSearching ? (
                      <div className="p-4 text-center text-primary-600">
                        <Search className="h-5 w-5 animate-spin mx-auto mb-2" />
                        <p className="text-sm">Searching...</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <>
                        {searchResults.map((movie) => (
                          <button
                            key={movie.id}
                            onClick={() => handleMovieClick(movie.id)}
                            className="w-full flex items-center space-x-3 p-3 hover:bg-primary-50 transition-colors text-left border-b border-primary-100 last:border-0"
                          >
                            <div className="flex-shrink-0 w-12 h-16 bg-primary-100">
                              {movie.posterPath ? (
                                <img
                                  src={getImageUrl(
                                    movie.posterPath,
                                    "poster",
                                    "small",
                                  )}
                                  alt={movie.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Film className="h-6 w-6 text-primary-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-primary-900 truncate">
                                {movie.title}
                              </h4>
                              <p className="text-xs text-primary-600 truncate">
                                {movie.releaseDate
                                  ? new Date(movie.releaseDate).getFullYear()
                                  : "N/A"}
                                {movie.genres &&
                                  movie.genres.length > 0 &&
                                  ` • ${movie.genres[0]}`}
                              </p>
                              {movie.rating && (
                                <p className="text-xs text-yellow-600">
                                  ★ {movie.rating.toFixed(1)}
                                </p>
                              )}
                            </div>
                          </button>
                        ))}
                      </>
                    ) : (
                      <div className="p-4 text-center text-primary-600">
                        <Film className="h-8 w-8 mx-auto mb-2 text-primary-400" />
                        <p className="text-sm">No movies found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* User Profile - Desktop */}
            <button className="hidden md:flex items-center space-x-2 text-primary-600 hover:text-primary-900 transition-colors duration-200">
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">Profile</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-primary-600 hover:text-primary-900 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-primary-100 py-4 animate-fade-in">
            {/* Mobile Search */}
            {showSearch && (
              <div className="px-4 pb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-primary-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search movies..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2 border border-primary-200 bg-white text-primary-900 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary-400 hover:text-primary-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Mobile Search Results */}
                {searchQuery && searchResults.length > 0 && (
                  <div className="mt-2 bg-white border border-primary-200 max-h-64 overflow-y-auto">
                    {searchResults.map((movie) => (
                      <button
                        key={movie.id}
                        onClick={() => {
                          handleMovieClick(movie.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 p-3 hover:bg-primary-50 transition-colors text-left border-b border-primary-100 last:border-0"
                      >
                        <div className="flex-shrink-0 w-10 h-14 bg-primary-100">
                          {movie.posterPath ? (
                            <img
                              src={getImageUrl(
                                movie.posterPath,
                                "poster",
                                "small",
                              )}
                              alt={movie.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Film className="h-5 w-5 text-primary-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-primary-900 truncate">
                            {movie.title}
                          </h4>
                          <p className="text-xs text-primary-600">
                            {movie.releaseDate
                              ? new Date(movie.releaseDate).getFullYear()
                              : "N/A"}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Mobile Profile */}
            <nav className="space-y-1">
              <button className="w-full text-left px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-900 hover:bg-primary-50 transition-colors duration-200 flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
