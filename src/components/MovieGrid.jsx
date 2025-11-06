import React, { memo, useMemo } from "react";
import MovieCard from "./MovieCard";
import { Film, AlertCircle } from "lucide-react";
import Pagination from "./Pagination";

const MovieGrid = memo(function MovieGrid({
                                              movies,
                                              loading,          // true on initial load only; keep as you had
                                              pageLoading = false, // NEW: pass true while fetching next page (keeps grid height stable)
                                              error,
                                              searchQuery,
                                              activeGenre,
                                              activeTab,
                                              currentPage,
                                              totalPages,
                                              onPageChange,
                                              onClearFilters,
                                          }) {
    // Header content memo to avoid recalcs
    const header = useMemo(() => {
        const title = searchQuery
            ? "Search Results"
            : activeGenre
                ? "Filtered Movies"
                : activeTab === "now_playing"
                    ? "Now Playing"
                    : "Coming Soon";

        const count = `${movies.length} ${movies.length === 1 ? "movie" : "movies"} found`;

        return { title, count };
    }, [activeGenre, activeTab, movies.length, searchQuery]);

    // Initial loading skeleton (first load only)
    if (loading) {
        return (
            <div>
                {/* Show header immediately even during loading */}
                <div className="mb-8 pb-6 border-b border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                                {activeTab === "now_playing" ? "Now Playing" : "Coming Soon"}
                            </h2>
                            <p className="text-sm text-white/60">Loading movies...</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6" data-movie-grid>
                    {Array.from({ length: 12 }).map((_, index) => (
                        <div key={index} className="overflow-hidden">
                            <div className="aspect-[2/3] bg-white/5 rounded-lg animate-pulse" />
                            <div className="pt-2.5 pb-3 space-y-2">
                                <div className="h-4 bg-white/5 rounded animate-pulse" />
                                <div className="h-3 bg-white/5 rounded w-3/4 animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-16" data-movie-grid>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-danger/10 mb-4">
                    <AlertCircle className="w-8 h-8 text-danger" />
                </div>
                <h3 className="text-xl font-semibold text-text mb-2">Something went wrong</h3>
                <p className="text-text-muted mb-6">{error}</p>
                <button onClick={() => window.location.reload()} className="btn-primary">Try Again</button>
            </div>
        );
    }

    if (!movies || movies.length === 0) {
        return (
            <div className="text-center py-16" data-movie-grid>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-light mb-4">
                    <Film className="w-8 h-8 text-text-dim" />
                </div>
                <h3 className="text-xl font-semibold text-text mb-2">No movies found</h3>
                <p className="text-text-muted mb-6">
                    {searchQuery
                        ? `No results for "${searchQuery}"`
                        : activeGenre
                            ? "No movies in this genre"
                            : "No movies available at the moment"}
                </p>
                {(searchQuery || activeGenre) && (
                    <button onClick={onClearFilters} className="btn-secondary">Clear Filters</button>
                )}
            </div>
        );
    }

    // Main content with stable layout on page changes
    return (
        <div data-movie-grid className="scroll-mt-24">
            {/* Header */}
            <div className="mb-8 pb-6 border-b border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{header.title}</h2>
                        <p className="text-sm text-white/60">
                            {header.count}
                            {searchQuery && (
                                <span className="ml-1">
                  for <span className="text-cinema-red font-medium">"{searchQuery}"</span>
                </span>
                            )}
                        </p>
                    </div>

                    {(searchQuery || activeGenre) && (
                        <button onClick={onClearFilters} className="btn-secondary text-sm whitespace-nowrap">
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Grid + veil during page fetch */}
            <div className="mb-10 relative">
                <div
                    className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 transition-opacity`}
                    style={{ opacity: pageLoading ? 0.5 : 1 }}
                >
                    {movies.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                    ))}
                </div>
                {pageLoading && (
                    <div className="absolute inset-0 pointer-events-none bg-base-900/40 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <div className="bg-surface/90 backdrop-blur-md px-6 py-4 rounded-lg border border-white/10 shadow-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 border-2 border-cinema-red border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm font-medium text-white">Loading movies...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="py-8 border-t border-white/10">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={onPageChange}
                        showInfo={true}
                        maxVisiblePages={5}
                    />
                </div>
            )}
        </div>
    );
});

export default MovieGrid;
