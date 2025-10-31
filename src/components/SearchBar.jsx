import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useDebounce } from "../hooks/useDebounce";
import { API_CONFIG } from "../utils/constants";

const SearchBar = ({
  onSearch,
  placeholder = "Search movies...",
  initialValue = "",
  className = "",
  showClearButton = true,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  // Sync with external value changes
  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  // Debounce the search term
  const debouncedSearchTerm = useDebounce(searchTerm, API_CONFIG.debounceDelay);

  // Call the search function when debounced term changes
  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClear = () => {
    setSearchTerm("");
    if (onSearch) {
      onSearch("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      handleClear();
      e.target.blur();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`relative transition-all duration-200 ${
          isFocused ? "ring-2 ring-primary-900 ring-offset-2" : ""
        }`}
      >
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search
            className={`h-4 w-4 transition-colors duration-200 ${
              isFocused ? "text-primary-900" : "text-primary-400"
            }`}
          />
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`block w-full pl-10 pr-10 py-3 border border-primary-200 bg-white text-primary-900 placeholder-primary-400 focus:outline-none focus:border-transparent text-sm transition-all duration-200 ${
            isFocused ? "bg-primary-50/30" : "hover:border-primary-300"
          }`}
        />

        {/* Clear Button */}
        {showClearButton && searchTerm && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              onClick={handleClear}
              className="p-1 text-primary-400 hover:text-primary-600 transition-colors duration-200 focus:outline-none focus:text-primary-600"
              type="button"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Search Results Indicator */}
      {debouncedSearchTerm && (
        <div className="absolute top-full left-0 right-0 mt-1 text-xs text-primary-500 px-3">
          Searching for "{debouncedSearchTerm}"...
        </div>
      )}
    </div>
  );
};

export default SearchBar;
