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

    useEffect(() => {
        setSearchTerm(initialValue);
    }, [initialValue]);

    const debounced = useDebounce(searchTerm, API_CONFIG.debounceDelay);

    useEffect(() => {
        onSearch?.(debounced);
    }, [debounced, onSearch]);

    return (
        <div className={`relative ${className}`}>
            <div className={`flex items-center bg-white/5 border rounded-lg px-4 py-3 transition-colors ${
                isFocused ? "border-white/30 bg-white/10" : "border-white/10"
            }`}>
                <Search className={`w-5 h-5 mr-3 transition-colors ${
                    isFocused ? "text-cinema-red" : "text-white/40"
                }`} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/30"
                />
                {showClearButton && searchTerm && (
                    <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                        aria-label="Clear search"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default SearchBar;