import React, { memo, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

const Pagination = memo(function Pagination({
                                                currentPage,
                                                totalPages,
                                                onPageChange,
                                                className = "",
                                                showInfo = true,
                                                maxVisiblePages = 5,
                                            }) {
    // Calculate visible pages with useMemo
    const visiblePages = useMemo(() => {
        const pages = [];
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            pages.push(1);
            if (startPage > 2) pages.push("ellipsis-start");
        }
        for (let i = startPage; i <= endPage; i++) pages.push(i);
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) pages.push("ellipsis-end");
            pages.push(totalPages);
        }
        return pages;
    }, [currentPage, maxVisiblePages, totalPages]);

    const handlePageClick = useCallback((page) => {
        if (page !== currentPage && page >= 1 && page <= totalPages) {
            onPageChange(page);
            // Scroll to movie grid section
            const movieGrid = document.querySelector('[data-movie-grid]');
            if (movieGrid) {
                movieGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    }, [currentPage, totalPages, onPageChange]);

    // Early return AFTER all hooks
    if (!totalPages || totalPages <= 1) return null;

    const prevDisabled = currentPage === 1;
    const nextDisabled = currentPage === totalPages;

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`} role="navigation" aria-label="Pagination">
            {showInfo && (
                <div className="text-sm text-white/60">
                    Page <span className="font-medium text-white">{currentPage}</span> of{" "}
                    <span className="font-medium text-white">{totalPages}</span>
                </div>
            )}

            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => !prevDisabled && handlePageClick(currentPage - 1)}
                    disabled={prevDisabled}
                    className={`p-2 rounded border transition-colors ${
                        prevDisabled
                            ? "border-white/10 text-white/30 cursor-not-allowed"
                            : "border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20"
                    }`}
                    aria-label="Previous page"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                    {visiblePages.map((page) =>
                        typeof page === "string" ? (
                            <div key={page} className="px-3 py-2 text-white/40" aria-hidden="true">
                                <MoreHorizontal className="w-4 h-4" />
                            </div>
                        ) : (
                            <button
                                key={page}
                                type="button"
                                onClick={() => handlePageClick(page)}
                                className={`px-3 py-2 text-sm font-medium rounded border transition-colors ${
                                    page === currentPage
                                        ? "bg-cinema-red text-white border-cinema-red"
                                        : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20"
                                }`}
                                aria-label={`Go to page ${page}`}
                                aria-current={page === currentPage ? "page" : undefined}
                            >
                                {page}
                            </button>
                        )
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => !nextDisabled && handlePageClick(currentPage + 1)}
                    disabled={nextDisabled}
                    className={`p-2 rounded border transition-colors ${
                        nextDisabled
                            ? "border-white/10 text-white/30 cursor-not-allowed"
                            : "border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20"
                    }`}
                    aria-label="Next page"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
});

export default Pagination;
