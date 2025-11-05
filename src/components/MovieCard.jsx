import React, { useState, memo } from "react";
import { Link } from "react-router-dom";
import { Star, Calendar, Play } from "lucide-react";
import { getImageUrl } from "../utils/api";
import { RATING_CONFIG } from "../utils/constants";
import LazyImage from "./LazyImage";

const MovieCard = memo(({ movie }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const formatRating = (rating) => (typeof rating === "number" ? rating.toFixed(1) : "N/A");
    const getRatingColor = (rating) => {
        if (!rating && rating !== 0) return "text-white/50";
        if (rating >= RATING_CONFIG.ratingThresholds.excellent) return "text-success";
        if (rating >= RATING_CONFIG.ratingThresholds.good) return "text-cinema-gold";
        if (rating >= RATING_CONFIG.ratingThresholds.average) return "text-warning";
        return "text-danger";
    };

    const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : null;
    const posterUrl = getImageUrl(movie.posterPath, "poster", "medium");
    const fallbackUrl = "/placeholder-movie-poster.jpg";

    const topGenre = Array.isArray(movie.genres) && movie.genres.length
        ? (typeof movie.genres[0] === "string" ? movie.genres[0] : movie.genres[0]?.name ?? String(movie.genres[0]))
        : null;

    return (
        <Link
            to={`/movie/${movie.id}`}
            aria-label={`View ${movie.title}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="block group"
        >
            <div className="h-full flex flex-col overflow-hidden transition-transform hover:scale-105">
                {/* Poster */}
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-surface-light border border-white/10 group-hover:border-white/30 transition-colors">
                    {!imageError ? (
                        <>
                            <LazyImage
                                src={posterUrl || fallbackUrl}
                                alt={movie.title || "Movie poster"}
                                className="w-full h-full object-cover"
                                placeholder="/placeholder-movie-poster.jpg"
                                onError={() => {
                                    setImageError(true);
                                    setImageLoaded(true);
                                }}
                                onLoad={() => setImageLoaded(true)}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </>
                    ) : (
                        <div className="w-full h-full grid place-items-center text-white/30">
                            <div className="text-center">
                                <div className="text-4xl mb-1">🎬</div>
                                <div className="text-xs text-white/40">No Image</div>
                            </div>
                        </div>
                    )}

                    {!imageLoaded && !imageError && (
                        <div className="absolute inset-0 bg-white/5 animate-pulse" />
                    )}

                    {/* Rating Badge */}
                    {typeof movie.rating === "number" && (
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
                            <div className={`flex items-center gap-1 text-xs font-semibold ${getRatingColor(movie.rating)}`}>
                                <Star className="w-3 h-3 fill-current" />
                                <span>{formatRating(movie.rating)}</span>
                            </div>
                        </div>
                    )}

                    {/* Coming Soon Badge */}
                    {movie.status === "coming-soon" && (
                        <div className="absolute top-2 right-2 bg-cinema-gold/90 backdrop-blur-sm px-2 py-1 rounded">
                            <span className="text-xs font-semibold text-base-900">Coming Soon</span>
                        </div>
                    )}

                    {/* Play Icon on Hover */}
                    <div className={`absolute inset-0 grid place-items-center transition-opacity ${
                        isHovered ? "opacity-100" : "opacity-0"
                    }`}>
                        <div className="bg-cinema-red rounded-full p-3 shadow-xl">
                            <Play className="w-5 h-5 text-white fill-current" />
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col pt-2.5 pb-3">
                    <h3 className="text-sm font-medium text-white line-clamp-2 leading-tight group-hover:text-cinema-red transition-colors mb-1.5 min-h-[1rem]">
                        {movie.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-white/60">
                        {year && (
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {year}
                            </span>
                        )}
                        {topGenre && (
                            <>
                                <span>•</span>
                                <span className="truncate">{topGenre}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
});

MovieCard.displayName = 'MovieCard';

export default MovieCard;
