import React from "react";
import { GENRE_OPTIONS } from "../utils/constants";

const Chip = ({ active, children, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
            active 
                ? "bg-cinema-red text-white" 
                : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20"
        }`}
    >
        {children}
    </button>
);

const FilterBar = ({ activeGenre, onGenreChange, className = "" }) => {
    return (
        <div className={className}>
            <div className="flex flex-wrap gap-2 justify-center">
                <Chip active={activeGenre === null} onClick={() => onGenreChange(null)}>
                    All Genres
                </Chip>
                {GENRE_OPTIONS.filter((g) => g.id !== "all").map((g) => (
                    <Chip
                        key={g.id}
                        active={activeGenre === g.value}
                        onClick={() => onGenreChange(g.value)}
                    >
                        {g.name}
                    </Chip>
                ))}
            </div>
        </div>
    );
};

export default FilterBar;
