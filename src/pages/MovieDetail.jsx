import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  Calendar,
  Clock,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Play,
  Globe,
  Ticket,
  X,
  Heart,
  Share2,
  Award,
  TrendingUp,
  Film,
} from "lucide-react";
import { getImageUrl } from "../utils/api";
import {
  fetchMovieById,
  formatBackendMovie,
  checkBackendHealth,
  fetchSimilarMoviesByGenreGroups,
} from "../utils/backendApi";
import { useMovieDetails } from "../hooks/useMovies";
import { API_CONFIG } from "../utils/constants";

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Check if ID is MongoDB or TMDB
  const isMongoId = id && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id);

  // Fetch from TMDB if numeric ID
  const { movie: tmdbMovie, loading: tmdbLoading } = useMovieDetails(
    !isMongoId ? id : null,
  );

  // Backend data
  const [useBackend, setUseBackend] = useState(true);
  const [backendMovie, setBackendMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [loadingTrailer, setLoadingTrailer] = useState(false);
  const [cast, setCast] = useState([]);
  const [director, setDirector] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [genreGroups, setGenreGroups] = useState({});
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentPage, setCurrentPage] = useState({});
  const ITEMS_PER_PAGE = 12;

  // Fetch backend movie
  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      setError(null);

      try {
        const isAvailable = await checkBackendHealth();

        if (isAvailable && id) {
          try {
            const movieData = await fetchMovieById(id);
            setBackendMovie(formatBackendMovie(movieData));
            setUseBackend(true);
          } catch (err) {
            console.error("Failed to fetch from backend:", err);
            setUseBackend(false);
          }
        } else {
          setUseBackend(false);
        }
      } catch (err) {
        console.error("Error:", err);
        setUseBackend(false);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovie();
    }
  }, [id]);

  // Fetch trailer and credits from backend or TMDB
  useEffect(() => {
    const fetchAdditionalData = async () => {
      // If we have backend movie, use its data
      if (useBackend && backendMovie) {
        console.log('🎬 Backend Movie Data:', backendMovie);
        console.log('🎥 Trailer URL:', backendMovie.trailerUrl);
        console.log('🔑 YouTube Key:', backendMovie.youtubeKey);
        console.log('👥 Cast Data:', backendMovie.cast);
        console.log('🎬 Crew Data:', backendMovie.crew);
        console.log('🎯 Director:', backendMovie.director);

        // Set trailer from backend
        if (backendMovie.youtubeKey) {
          setTrailerKey(backendMovie.youtubeKey);
          console.log('✅ Trailer key set:', backendMovie.youtubeKey);
        } else {
          console.warn('⚠️ No YouTube key found in backend movie');
        }

        // Set cast from backend - ALWAYS set even if empty
        if (backendMovie.cast) {
          if (Array.isArray(backendMovie.cast)) {
            setCast(backendMovie.cast);
            console.log('✅ Cast loaded:', backendMovie.cast.length, 'members');
          } else {
            console.warn('⚠️ Cast is not an array:', typeof backendMovie.cast);
            setCast([]);
          }
        } else {
          console.warn('⚠️ No cast data in backend movie');
          setCast([]);
        }

        // Set director from backend crew - ALWAYS attempt to set
        if (backendMovie.crew && Array.isArray(backendMovie.crew)) {
          const directorData = backendMovie.crew.find(person => person.job === 'Director');
          if (directorData) {
            setDirector(directorData);
            console.log('✅ Director set:', directorData.name);
          } else {
            console.warn('⚠️ No director found in crew');
            setDirector(null);
          }
        } else if (backendMovie.director) {
          // Fallback: if director is a string in the movie object
          setDirector({ name: backendMovie.director });
          console.log('✅ Director set from string:', backendMovie.director);
        } else {
          console.warn('⚠️ No crew or director data');
          setDirector(null);
        }

        // Fetch similar movies grouped by genre from backend
        if (backendMovie.genres && backendMovie.genres.length > 0) {
          try {
            const groups = await fetchSimilarMoviesByGenreGroups(
              backendMovie.id,
              backendMovie.genres
            );
            setGenreGroups(groups);
            console.log('✅ Similar movies loaded:', Object.keys(groups).length, 'genres');
          } catch (err) {
            console.error('Failed to fetch similar movies:', err);
          }
        }

        return;
      }

      // Fallback to TMDB for non-backend movies
      if (!useBackend && !isMongoId && id) {
        setLoadingTrailer(true);
        try {
          // Fetch trailer
          const trailerResponse = await fetch(
            `${API_CONFIG.baseURL}/movie/${id}/videos?api_key=${API_CONFIG.apiKey}`,
          );
          const trailerData = await trailerResponse.json();

          if (trailerData.results && trailerData.results.length > 0) {
            const trailer = trailerData.results.find(
              (video) =>
                video.site === "YouTube" &&
                (video.type === "Trailer" || video.type === "Teaser"),
            );

            if (trailer) {
              setTrailerKey(trailer.key);
            }
          }

          // Fetch cast and crew
          const creditsResponse = await fetch(
            `${API_CONFIG.baseURL}/movie/${id}/credits?api_key=${API_CONFIG.apiKey}`,
          );
          const creditsData = await creditsResponse.json();

          if (creditsData.cast) {
            setCast(creditsData.cast.slice(0, 12));
          } else {
            setCast([]);
          }

          if (creditsData.crew) {
            const directorData = creditsData.crew.find(
              (person) => person.job === "Director",
            );
            if (directorData) {
              setDirector(directorData);
            } else {
              setDirector(null);
            }
          } else {
            setDirector(null);
          }

          // Fetch similar movies
          const similarResponse = await fetch(
            `${API_CONFIG.baseURL}/movie/${id}/similar?api_key=${API_CONFIG.apiKey}`,
          );
          const similarData = await similarResponse.json();

          if (similarData.results) {
            setSimilarMovies(similarData.results.slice(0, 12));
          }
        } catch (err) {
          console.error("Failed to fetch additional data:", err);
        } finally {
          setLoadingTrailer(false);
        }
      }
    };

    fetchAdditionalData();
  }, [id, isMongoId, useBackend, backendMovie]);

  // Use backend movie if available, otherwise TMDB
  const displayMovie = useBackend && backendMovie ? backendMovie : tmdbMovie;

  const handleBookTickets = () => {
    if (!displayMovie) return;
    navigate(`/booking/${displayMovie.id}`);
  };

  const movieTitle = displayMovie?.title;

  const handleShare = () => {
    if (!displayMovie) return;
    if (navigator.share) {
      navigator.share({
        title: movieTitle,
        text: `Check out ${movieTitle}!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading || tmdbLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="opacity-70">Loading movie details…</p>
        </div>
      </div>
    );
  }

  if (!displayMovie) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 mx-auto mb-3" />
          <h3 className="text-xl font-semibold mb-1">Movie not found</h3>
          <p className="opacity-70 mb-6">
            The requested movie could not be found.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-md border border-white/20 hover:bg-white/10 transition"
          >
            Back to Movies
          </button>
        </div>
      </div>
    );
  }

  const backdropUrl =
    displayMovie.backdrop_path || displayMovie.backdropPath
      ? `https://image.tmdb.org/t/p/original${displayMovie.backdrop_path || displayMovie.backdropPath}`
      : null;

  const posterUrl = getImageUrl(
    displayMovie.poster_path || displayMovie.posterPath,
    "poster",
    "large",
  );

  const movieRating = displayMovie.vote_average || displayMovie.rating;
  const movieVoteCount = displayMovie.vote_count;
  const movieDuration = displayMovie.runtime || displayMovie.duration;
  const movieReleaseDate =
    displayMovie.release_date || displayMovie.releaseDate;
  const movieGenres = displayMovie.genres || [];
  const movieOverview = displayMovie.overview;
  const movieLanguage = displayMovie.original_language || displayMovie.language;
  const movieStatus = displayMovie.status;
  const movieBudget = displayMovie.budget;
  const movieRevenue = displayMovie.revenue;
  const moviePopularity = displayMovie.popularity;

  return (
    <div className="min-h-screen bg-base-900 text-white">
      {/* Clean Hero */}
      <div className="relative h-[60vh] min-h-[500px] w-full">
        {backdropUrl && (
          <>
            <img
              src={backdropUrl}
              alt={movieTitle}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-base-900 via-base-900/60 to-base-900/20" />
          </>
        )}

        {/* Top Actions Bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors"
              aria-label="Toggle favorite"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-current text-cinema-red" : ""}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors"
              aria-label="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Movie Info */}
        <div className="absolute bottom-6 left-4 right-4 md:left-8 md:right-8 flex items-end gap-4 md:gap-6 z-10">
          <div className="w-28 sm:w-36 md:w-44 aspect-[2/3] rounded-lg overflow-hidden bg-surface-light border border-white/10 shadow-2xl flex-shrink-0">
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={movieTitle}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder-movie-poster.jpg";
                }}
              />
            ) : (
              <div className="w-full h-full grid place-items-center text-white/30">
                <Film className="w-10 h-10" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pb-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
              {movieTitle}
            </h1>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-white/80 mb-3">
              {movieRating && (
                <span className="inline-flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-cinema-gold" />
                  <strong className="font-semibold text-white">
                    {movieRating.toFixed(1)}
                  </strong>
                  {movieVoteCount && (
                    <span className="text-white/50">
                      ({movieVoteCount.toLocaleString()})
                    </span>
                  )}
                </span>
              )}
              {movieDuration && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {movieDuration} min
                </span>
              )}
              {movieReleaseDate && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {new Date(movieReleaseDate).getFullYear()}
                </span>
              )}
            </div>

            {movieGenres && movieGenres.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs mb-4">
                {movieGenres.slice(0, 3).map((genre, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full bg-white/10 text-white/90 border border-white/20"
                  >
                    {typeof genre === "string" ? genre : genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Coming Soon Badge & Release Date */}
            {movieStatus === "coming-soon" && movieReleaseDate && (
              <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cinema-gold/20 border border-cinema-gold/40">
                <Calendar className="w-4 h-4 text-cinema-gold" />
                <span className="text-sm font-medium text-cinema-gold">
                  Coming Soon - Releases {new Date(movieReleaseDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Show Book Tickets only for now-showing movies */}
              {(movieStatus === "now-showing" || movieStatus === "now_playing") && (
                <button
                  onClick={handleBookTickets}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-cinema-red text-white font-medium hover:bg-cinema-red-dark transition-colors inline-flex items-center gap-2 text-sm"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Book Tickets</span>
                </button>
              )}

              {/* Show trailer button for all movies if available */}
              {trailerKey && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium hover:bg-white/20 transition-colors inline-flex items-center gap-2 text-sm"
                >
                  <Play className="w-4 h-4" />
                  <span>Watch Trailer</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && trailerKey && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm grid place-items-center p-4"
          onClick={() => setShowTrailer(false)}
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-12 right-0 px-3 py-2 rounded-md border border-white/20 hover:bg-white/10 transition inline-flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Close
            </button>
            <div className="relative pt-[56.25%] rounded-lg overflow-hidden ring-1 ring-white/10">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                title="Movie Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Overview */}
        {movieOverview && (
          <section className="mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-text mb-3">Overview</h2>
            <p className="text-white/80 leading-relaxed">{movieOverview}</p>
          </section>
        )}

        {/* Stats */}
        {(movieBudget || movieRevenue || moviePopularity) && (
          <section className="mb-8 pb-8 border-b border-white/10">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/70">
              {movieBudget > 0 && (
                <span>
                  Budget: <strong className="text-white">${(movieBudget / 1_000_000).toFixed(1)}M</strong>
                </span>
              )}
              {movieRevenue > 0 && (
                <span>
                  Revenue: <strong className="text-white">${(movieRevenue / 1_000_000).toFixed(1)}M</strong>
                </span>
              )}
              {moviePopularity && (
                <span className="inline-flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Popularity <strong className="ml-1 text-white">{moviePopularity.toFixed(0)}</strong>
                </span>
              )}
            </div>
          </section>
        )}

        {/* Director */}
        {director && (
          <section className="mb-8 pb-8 border-b border-white/10">
            <h2 className="text-lg sm:text-xl font-semibold text-text mb-4">Director</h2>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-light border border-white/10 flex-shrink-0">
                {director.profile_path || director.profileUrl ? (
                  <img
                    src={director.profileUrl || `https://image.tmdb.org/t/p/w185${director.profile_path}`}
                    alt={director.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full grid place-items-center text-white/30"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>';
                    }}
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-white/30">
                    <Award className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-text">{director.name}</h3>
                <p className="text-sm text-white/60">Director</p>
              </div>
            </div>
          </section>
        )}

        {/* Cast */}
        {cast.length > 0 && (
          <section className="mb-8 pb-8 border-b border-white/10">
            <h2 className="text-lg sm:text-xl font-semibold text-text mb-4">
              Cast
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {cast.map((person, index) => (
                <div key={person.id || index} className="text-center">
                  <div className="mx-auto w-20 h-20 rounded-full overflow-hidden bg-surface-light border border-white/10 mb-2">
                    {person.profile_path || person.profileUrl ? (
                      <img
                        src={person.profileUrl || `https://image.tmdb.org/t/p/w185${person.profile_path}`}
                        alt={person.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full grid place-items-center text-white/30"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-white/30">
                        <Award className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-xs text-white truncate">{person.name}</h3>
                  <p className="text-[10px] text-white/50 truncate">{person.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Similar Movies by Genre with Pagination */}
        {Object.keys(genreGroups).length > 0 && (
          <>
            {Object.entries(genreGroups).map(([genre, movies]) => {
              const page = currentPage[genre] || 1;
              const totalPages = Math.ceil(movies.length / ITEMS_PER_PAGE);
              const startIdx = (page - 1) * ITEMS_PER_PAGE;
              const endIdx = startIdx + ITEMS_PER_PAGE;
              const paginatedMovies = movies.slice(startIdx, endIdx);

              return (
                <section key={genre} className="mb-8 pb-8 border-b border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-text">
                      More in {genre}
                    </h2>
                    {totalPages > 1 && (
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <span>{page} / {totalPages}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
                    {paginatedMovies.map((movie) => (
                      <button
                        key={movie.id}
                        onClick={() => {
                          navigate(`/movie/${movie.id}`);
                          window.scrollTo(0, 0);
                        }}
                        className="text-left group"
                      >
                        <div className="aspect-[2/3] rounded overflow-hidden bg-surface-light border border-white/10 group-hover:border-white/30 transition-all">
                          {movie.posterPath ? (
                            <img
                              src={movie.posterPath}
                              alt={movie.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full grid place-items-center text-white/30">
                              <Film className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        <h3 className="mt-2 text-xs sm:text-sm font-medium line-clamp-2 text-white/90 group-hover:text-white">
                          {movie.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-1 text-xs text-white/70">
                          <Star className="w-3 h-3 fill-current text-cinema-gold" />
                          <span>{movie.rating?.toFixed(1) || movie.vote_average?.toFixed(1) || 'N/A'}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => ({ ...prev, [genre]: Math.max(1, page - 1) }))}
                        disabled={page === 1}
                        className="px-3 py-1.5 text-sm rounded bg-white/10 border border-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (page <= 3) {
                            pageNum = i + 1;
                          } else if (page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(prev => ({ ...prev, [genre]: pageNum }))}
                              className={`w-8 h-8 text-sm rounded transition-colors ${
                                page === pageNum
                                  ? 'bg-cinema-red text-white'
                                  : 'bg-white/10 border border-white/10 hover:bg-white/20'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setCurrentPage(prev => ({ ...prev, [genre]: Math.min(totalPages, page + 1) }))}
                        disabled={page === totalPages}
                        className="px-3 py-1.5 text-sm rounded bg-white/10 border border-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </section>
              );
            })}
          </>
        )}

        {/* Fallback: Show TMDB similar movies if no genre groups */}
        {Object.keys(genreGroups).length === 0 && similarMovies.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-text mb-4">
              Similar Movies
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
              {similarMovies.map((movie) => (
                <button
                  key={movie.id}
                  onClick={() => {
                    navigate(`/movie/${movie.id}`);
                    window.scrollTo(0, 0);
                  }}
                  className="text-left group"
                >
                  <div className="aspect-[2/3] rounded overflow-hidden bg-surface-light border border-white/10 group-hover:border-white/30 transition-all">
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-white/30">
                        <Film className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <h3 className="mt-2 text-xs sm:text-sm font-medium line-clamp-2 text-white/90 group-hover:text-white">
                    {movie.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-1 text-xs text-white/70">
                    <Star className="w-3 h-3 fill-current text-cinema-gold" />
                    <span>{movie.vote_average?.toFixed(1)}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default MovieDetails;
