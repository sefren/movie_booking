import React from "react";
import { GENRE_OPTIONS } from "../utils/constants";

const FilterBar = ({ activeGenre, onGenreChange, className = "" }) => {
  return (
    <div className={`${className}`}>
      {/* Genre Pills */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => onGenreChange(null)}
          className={`px-4 py-2 text-sm font-medium border transition-all duration-200 ${
            activeGenre === null
              ? "bg-primary-900 text-white border-primary-900"
              : "bg-white text-primary-600 border-primary-200 hover:border-primary-900 hover:text-primary-900"
          }`}
        >
          All Genres
        </button>
        {GENRE_OPTIONS.filter((genre) => genre.id !== "all").map((genre) => (
          <button
            key={genre.id}
            onClick={() => onGenreChange(genre.value)}
            className={`px-4 py-2 text-sm font-medium border transition-all duration-200 ${
              activeGenre === genre.value
                ? "bg-primary-900 text-white border-primary-900"
                : "bg-white text-primary-600 border-primary-200 hover:border-primary-900 hover:text-primary-900"
            }`}
          >
            {genre.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
