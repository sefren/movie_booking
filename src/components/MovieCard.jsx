import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Star, Calendar, Clock } from "lucide-react";
import { getImageUrl } from "../utils/api";
import { RATING_CONFIG } from "../utils/constants";

const MovieCard = ({ movie }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatRating = (rating) => {
    return rating ? rating.toFixed(1) : "N/A";
  };

  const getRatingColor = (rating) => {
    if (rating >= RATING_CONFIG.ratingThresholds.excellent)
      return "text-green-600";
    if (rating >= RATING_CONFIG.ratingThresholds.good) return "text-yellow-600";
    if (rating >= RATING_CONFIG.ratingThresholds.average)
      return "text-orange-600";
    return "text-red-600";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "TBA";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const posterUrl = getImageUrl(movie.posterPath, "poster", "medium");
  const fallbackUrl = "/placeholder-movie-poster.jpg";

  return (
    <div className="group bg-white border border-primary-100 overflow-hidden transition-all duration-300 hover:border-primary-300">
      <Link to={`/movie/${movie.id}`} className="block">
        {/* Movie Poster */}
        <div className="relative aspect-[2/3] bg-primary-50 overflow-hidden">
          {!imageError ? (
            <img
              src={posterUrl || fallbackUrl}
              alt={movie.title}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary-100">
              <div className="text-center text-primary-400">
                <div className="text-6xl font-light mb-2">🎬</div>
                <div className="text-xs">No Image</div>
              </div>
            </div>
          )}

          {/* Loading shimmer */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 loading-shimmer"></div>
          )}

          {/* Rating Badge */}
          {movie.rating && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 flex items-center space-x-1">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              <span
                className={`text-xs font-medium ${getRatingColor(movie.rating)}`}
              >
                {formatRating(movie.rating)}
              </span>
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-primary-900/0 group-hover:bg-primary-900/10 transition-all duration-300"></div>
        </div>

        {/* Movie Info */}
        <div className="p-4">
          {/* Title */}
          <h3 className="text-lg font-semibold text-primary-900 mb-2 line-clamp-2 group-hover:text-primary-700 transition-colors duration-200">
            {movie.title}
          </h3>

          {/* Release Date */}
          {movie.releaseDate && (
            <div className="flex items-center space-x-1 text-primary-500 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{formatDate(movie.releaseDate)}</span>
            </div>
          )}

          {/* Genres */}
          {/* Genres */}
          {Array.isArray(movie.genres) && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {movie.genres.slice(0, 2).map((genre, index) => {
                // Debug log
                console.log("🎭 MovieCard genre:", genre);

                // Normalize each genre
                let genreName = "";
                if (typeof genre === "string") genreName = genre;
                else if (genre && typeof genre === "object")
                  genreName = genre.name || JSON.stringify(genre);
                else genreName = String(genre);

                return (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 border border-primary-200"
                  >
                    {genreName}
                  </span>
                );
              })}

              {movie.genres.length > 2 && (
                <span className="inline-block px-2 py-1 text-xs font-medium text-primary-500">
                  +{movie.genres.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Overview */}
          {movie.overview && (
            <p className="text-sm text-primary-600 line-clamp-3 leading-relaxed">
              {movie.overview}
            </p>
          )}

          {/* Book Now Button */}
          <div className="mt-4 pt-4 border-t border-primary-100">
            <button className="w-full btn-primary text-center">Book Now</button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default MovieCard;
