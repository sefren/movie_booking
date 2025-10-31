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

    // Adjust start page if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push("ellipsis-start");
      }
    }

    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis and last page if needed
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
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
    >
      {/* Page Info */}
      {showInfo && (
        <div className="text-sm text-primary-600">
          Page{" "}
          <span className="font-medium text-primary-900">{currentPage}</span> of{" "}
          <span className="font-medium text-primary-900">{totalPages}</span>
        </div>
      )}

      {/* Pagination Controls */}
      <nav className="flex items-center space-x-1">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`p-2 border transition-all duration-200 ${
            currentPage === 1
              ? "border-primary-200 text-primary-400 cursor-not-allowed"
              : "border-primary-200 text-primary-600 hover:border-primary-900 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-900 focus:ring-offset-2"
          }`}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {visiblePages.map((page) => {
            if (typeof page === "string" && page.startsWith("ellipsis")) {
              return (
                <div
                  key={page}
                  className="px-3 py-2 text-primary-400"
                  aria-label="More pages"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </div>
              );
            }

            return (
              <button
                key={page}
                onClick={() => handlePageClick(page)}
                className={`px-3 py-2 text-sm font-medium border transition-all duration-200 ${
                  page === currentPage
                    ? "bg-primary-900 text-white border-primary-900"
                    : "bg-white text-primary-600 border-primary-200 hover:border-primary-900 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-900 focus:ring-offset-2"
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
          className={`p-2 border transition-all duration-200 ${
            currentPage === totalPages
              ? "border-primary-200 text-primary-400 cursor-not-allowed"
              : "border-primary-200 text-primary-600 hover:border-primary-900 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-900 focus:ring-offset-2"
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
