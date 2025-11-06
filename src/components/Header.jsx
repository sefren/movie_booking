import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDebounce } from "../hooks/useDebounce";
import { getImageUrl } from "../utils/api";
import {
    fetchMoviesFromBackend,
    formatBackendMovie,
    checkBackendHealth,
} from "../utils/backendApi";
import { searchMovies, formatMovieData } from "../utils/api";
import { API_CONFIG } from "../utils/constants";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "./AuthModal";
import { Search, User, Menu, LogOut, X, Film } from "lucide-react";

const Header = ({ showSearch = true }) => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [useBackend, setUseBackend] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const searchRef = useRef(null);
    const navigate = useNavigate();
    const { user, logout, isAuthenticated } = useAuth();

    const debounced = useDebounce(searchQuery, API_CONFIG.debounceDelay);

    // Check backend availability
    useEffect(() => {
        (async () => {
            const ok = await checkBackendHealth();
            setUseBackend(ok);
        })();
    }, []);

    // Click outside to close dropdown
    useEffect(() => {
        const onDocClick = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    // ESC closes dropdown and mobile menu
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") {
                setShowDropdown(false);
                setIsMobileOpen(false);
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    // Search
    useEffect(() => {
        const run = async () => {
            const q = debounced.trim();
            if (!q) {
                setResults([]);
                setIsSearching(false);
                return;
            }
            setIsSearching(true);
            try {
                if (useBackend) {
                    const backendMovies = await fetchMoviesFromBackend({ search: q, limit: 6 });
                    setResults(Array.isArray(backendMovies) ? backendMovies.map(formatBackendMovie) : []);
                } else {
                    const resp = await searchMovies(q);
                    setResults((resp.results || []).slice(0, 6).map(formatMovieData));
                }
            } catch {
                setResults([]);
            } finally {
                setIsSearching(false);
            }
        };
        run();
    }, [debounced, useBackend]);

    const handleMovieClick = useCallback(
        (id) => {
            setShowDropdown(false);
            setSearchQuery("");
            setResults([]);
            setIsMobileOpen(false);
            navigate(`/movie/${id}`);
        },
        [navigate]
    );

    const handleLogout = () => {
        logout();
        setIsMobileOpen(false);
        navigate("/");
    };

    const clearSearch = () => {
        setSearchQuery("");
        setResults([]);
        setShowDropdown(false);
    };

    return (
        <>
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-base-900/95 border-b border-white/10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="h-16 flex items-center justify-between gap-4 sm:gap-6">
                        {/* Polished Logo */}
                        <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0" onClick={() => setIsMobileOpen(false)}>
                            <div className="relative">
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cinema-red to-cinema-red-dark flex items-center justify-center shadow-lg shadow-cinema-red/20 transition-transform group-hover:scale-105">
                                    <span className="text-sm font-bold text-white">S9</span>
                                </div>
                                <div className="absolute -inset-1 bg-cinema-red/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                            </div>
                            <div>
                                <span className="text-base font-bold text-white tracking-tight block">Studio 9</span>
                                <span className="text-[10px] text-white/40 uppercase tracking-wider -mt-0.5 block">Cinema</span>
                            </div>
                        </Link>

                        {/* Polished Search (desktop) */}
                        {showSearch && (
                            <div className="hidden md:block flex-1 max-w-lg">
                                <div ref={searchRef} className="relative">
                                    <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 transition-all focus-within:bg-white/10 focus-within:border-white/20 focus-within:shadow-lg focus-within:shadow-white/5">
                                        <Search className="h-4 w-4 text-white/40 flex-shrink-0" />
                                        <input
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                if (e.target.value) setShowDropdown(true);
                                            }}
                                            onFocus={() => searchQuery && setShowDropdown(true)}
                                            placeholder="Search movies..."
                                            className="w-full bg-transparent text-sm text-white placeholder-white/30 outline-none ml-2.5"
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={clearSearch}
                                                className="text-white/40 hover:text-white/80 flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
                                                aria-label="Clear search"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Polished Search Results Dropdown */}
                                    {showDropdown && searchQuery && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-surface/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl max-h-96 overflow-y-auto">
                                            {isSearching ? (
                                                <div className="p-6 text-center">
                                                    <Search className="h-5 w-5 animate-pulse text-white/40 mx-auto mb-2" />
                                                    <span className="text-sm text-white/60">Searching...</span>
                                                </div>
                                            ) : results.length > 0 ? (
                                                <div className="py-2">
                                                    {results.map((movie) => (
                                                        <button
                                                            key={movie.id}
                                                            onClick={() => handleMovieClick(movie.id)}
                                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left group"
                                                        >
                                                            {movie.posterPath || movie.poster_path ? (
                                                                <img
                                                                    src={getImageUrl(movie.posterPath || movie.poster_path, "poster", "small")}
                                                                    alt={movie.title}
                                                                    className="w-10 h-14 object-cover rounded border border-white/10 shadow-lg"
                                                                />
                                                            ) : (
                                                                <div className="w-10 h-14 bg-white/5 rounded border border-white/10 flex items-center justify-center">
                                                                    <Film className="w-4 h-4 text-white/30" />
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-white truncate group-hover:text-cinema-red transition-colors">
                                                                    {movie.title}
                                                                </p>
                                                                <p className="text-xs text-white/50">
                                                                    {movie.releaseDate || movie.release_date ? new Date(movie.releaseDate || movie.release_date).getFullYear() : "N/A"}
                                                                </p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-6 text-center">
                                                    <Film className="mx-auto mb-2 h-10 w-10 text-white/20" />
                                                    <p className="text-sm text-white/50">No results for "{searchQuery}"</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Polished Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-2">
                            {isAuthenticated() ? (
                                <>
                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white/90 hover:text-white text-sm font-medium"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-cinema-red flex items-center justify-center text-xs font-bold">
                                            {user?.name?.charAt(0).toUpperCase() || "U"}
                                        </div>
                                        <span className="max-w-[10ch] truncate">{user?.name || "Profile"}</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all"
                                        aria-label="Logout"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setShowAuthModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-base-900 hover:bg-white/90 transition-all font-medium text-sm shadow-lg shadow-white/10"
                                >
                                    <User className="w-4 h-4" />
                                    <span>Sign In</span>
                                </button>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileOpen(!isMobileOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-white/5 text-white transition-all"
                            aria-label="Toggle menu"
                        >
                            {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>

                    {/* Polished Mobile Menu */}
                    {isMobileOpen && (
                        <div className="md:hidden py-4 border-t border-white/10">
                            {showSearch && (
                                <div className="mb-4">
                                    <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-3 py-2.5">
                                        <Search className="h-4 w-4 text-white/40 flex-shrink-0" />
                                        <input
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search movies..."
                                            className="w-full bg-transparent text-sm text-white placeholder-white/30 outline-none ml-2.5"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                {isAuthenticated() ? (
                                    <>
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsMobileOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/90 hover:bg-white/5 rounded-lg transition-all font-medium"
                                        >
                                            <div className="w-6 h-6 rounded-full bg-cinema-red flex items-center justify-center text-xs font-bold">
                                                {user?.name?.charAt(0).toUpperCase() || "U"}
                                            </div>
                                            <span>{user?.name || "Profile"}</span>
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white/90 hover:bg-white/5 rounded-lg transition-all font-medium text-left"
                                        >
                                            <LogOut className="w-4 h-4 text-white/60" />
                                            <span>Logout</span>
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setShowAuthModal(true);
                                            setIsMobileOpen(false);
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-base-900 hover:bg-white/90 rounded-lg transition-all font-medium text-sm shadow-lg"
                                    >
                                        <User className="w-4 h-4" />
                                        <span>Sign In</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                initialMode="login"
            />
        </>
    );
};

export default Header;

