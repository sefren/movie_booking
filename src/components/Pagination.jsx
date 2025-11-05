import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
  showInfo = true,
  maxVisiblePages = 5,
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push("ellipsis-start");
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push("ellipsis-end");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  const handlePageClick = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Page Info */}
      {showInfo && (
        <div className="text-sm text-white/60">
          Page <span className="font-medium text-white">{currentPage}</span> of{" "}
          <span className="font-medium text-white">{totalPages}</span>
        </div>
      )}

      {/* Pagination Controls */}
      <nav className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`p-2 rounded border transition-colors ${
            currentPage === 1
              ? "border-white/10 text-white/30 cursor-not-allowed"
              : "border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20"
          }`}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page) => {
            if (typeof page === "string" && page.startsWith("ellipsis")) {
              return (
                <div key={page} className="px-3 py-2 text-white/40" aria-label="More pages">
                  <MoreHorizontal className="w-4 h-4" />
                </div>
              );
            }

            return (
              <button
                key={page}
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
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`p-2 rounded border transition-colors ${
            currentPage === totalPages
              ? "border-white/10 text-white/30 cursor-not-allowed"
              : "border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20"
          }`}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
