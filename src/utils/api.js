// TMDB API configuration and utilities
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// API Key from environment
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || "your_api_key_here";

// Image size configurations
export const IMAGE_SIZES = {
  poster: {
    small: "w342",
    medium: "w500",
    large: "w780",
    original: "original",
  },
  backdrop: {
    small: "w780",
    medium: "w1280",
    large: "original",
  },
};

// Genre mapping for filters
export const GENRES = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

// API request helper
const apiRequest = async (endpoint, params = {}) => {
  try {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.append("api_key", TMDB_API_KEY);

    // Add additional parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

// Get image URL
export const getImageUrl = (path, type = "poster", size = "medium") => {
  if (!path) return null;
  const sizeKey = IMAGE_SIZES[type][size];
  return `${TMDB_IMAGE_BASE_URL}/${sizeKey}${path}`;
};

// Get genre name by ID
export const getGenreName = (genreId) => {
  return GENRES[genreId] || "Unknown";
};

// Format movie data for consistent use across components
export const formatMovieData = (movie) => {
  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    posterPath: movie.poster_path,
    backdropPath: movie.backdrop_path,
    releaseDate: movie.release_date,
    rating: movie.vote_average,
    voteCount: movie.vote_count,
    genres: movie.genre_ids?.map((id) => getGenreName(id)) || [],
    genreIds: movie.genre_ids || [],
    adult: movie.adult,
    originalLanguage: movie.original_language,
    popularity: movie.popularity,
  };
};

/**
 * REALISTIC THEATER API CALLS
 * A real theater shows a curated selection, not all movies from TMDB
 */

// Fetch NOW PLAYING movies (what's currently in the theater)
// This should return ALL current movies on ONE page (no pagination needed)
export const fetchNowPlayingMovies = async () => {
  try {
    // Check if API key is configured
    if (!TMDB_API_KEY || TMDB_API_KEY === "your_api_key_here") {
      console.warn("TMDB API key not configured, using mock data");
      return {
        results: MOCK_MOVIES.slice(0, 8),
        total_pages: 1,
        total_results: 8,
        page: 1,
      };
    }

    // Fetch first page of now playing
    const response = await apiRequest("/movie/now_playing", { page: 1 });

    // A realistic theater shows 10-15 movies at once
    const theaterMovies = response.results.slice(0, 12);

    return {
      results: theaterMovies,
      total_pages: 1, // Single page - show everything at once
      total_results: theaterMovies.length,
      page: 1,
    };
  } catch (error) {
    console.error(
      "Failed to fetch now playing movies, using mock data:",
      error,
    );
    return {
      results: MOCK_MOVIES.slice(0, 8),
      total_pages: 1,
      total_results: 8,
      page: 1,
    };
  }
};

// Fetch COMING SOON movies (future releases)
// This can have pagination since there are more upcoming movies
export const fetchUpcomingMovies = async (page = 1) => {
  try {
    // Check if API key is configured
    if (!TMDB_API_KEY || TMDB_API_KEY === "your_api_key_here") {
      console.warn("TMDB API key not configured, using mock data");
      return {
        results: MOCK_MOVIES.slice(0, 4),
        total_pages: 1,
        total_results: 4,
        page: 1,
      };
    }

    const response = await apiRequest("/movie/upcoming", { page });

    // Limit to next 2-3 months of releases (realistic for a theater)
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);

    const upcomingMovies = response.results.filter((movie) => {
      if (!movie.release_date) return false;
      const releaseDate = new Date(movie.release_date);
      return releaseDate >= today && releaseDate <= threeMonthsFromNow;
    });

    return {
      results: upcomingMovies.slice(0, 20), // Show 20 per page for upcoming
      total_pages: Math.ceil(upcomingMovies.length / 20),
      total_results: upcomingMovies.length,
      page,
    };
  } catch (error) {
    console.error("Failed to fetch upcoming movies, using mock data:", error);
    return {
      results: MOCK_MOVIES.slice(0, 4),
      total_pages: 1,
      total_results: 4,
      page: 1,
    };
  }
};

// Search movies (searches through both now playing and upcoming)
export const searchMovies = async (query) => {
  if (!query.trim()) {
    return { results: [], total_pages: 0, total_results: 0 };
  }

  try {
    // Get both now playing and upcoming to create our "theater catalog"
    const [nowPlaying, upcoming] = await Promise.all([
      fetchNowPlayingMovies(),
      fetchUpcomingMovies(1),
    ]);

    // Combine both lists
    const allTheaterMovies = [...nowPlaying.results, ...upcoming.results];

    // Search through our theater catalog
    const searchQuery = query.toLowerCase();
    const searchResults = allTheaterMovies.filter((movie) => {
      const titleMatch = movie.title?.toLowerCase().includes(searchQuery);
      const overviewMatch = movie.overview?.toLowerCase().includes(searchQuery);
      return titleMatch || overviewMatch;
    });

    return {
      results: searchResults,
      total_pages: 1,
      total_results: searchResults.length,
      page: 1,
    };
  } catch (error) {
    console.error("Search failed, using mock data:", error);
    // Fallback to mock data search
    const searchQuery = query.toLowerCase();
    const searchResults = MOCK_MOVIES.filter((movie) => {
      const titleMatch = movie.title?.toLowerCase().includes(searchQuery);
      const overviewMatch = movie.overview?.toLowerCase().includes(searchQuery);
      return titleMatch || overviewMatch;
    });
    return {
      results: searchResults,
      total_pages: 1,
      total_results: searchResults.length,
      page: 1,
    };
  }
};

// Filter movies by genre (client-side filtering of theater movies)
export const filterMoviesByGenre = (movies, genreId) => {
  if (!genreId) return movies;

  return movies.filter((movie) => {
    return movie.genreIds && movie.genreIds.includes(genreId);
  });
};

// Fetch movie details
export const fetchMovieDetails = async (movieId) => {
  try {
    return await apiRequest(`/movie/${movieId}`, {
      append_to_response: "credits,videos,similar",
    });
  } catch (error) {
    console.error("Failed to fetch movie details:", error);
    throw error;
  }
};

/**
 * MOCK DATA FOR FALLBACK
 */
export const MOCK_MOVIES = [
  {
    id: 1,
    title: "The Dark Knight",
    overview:
      "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdrop_path: "/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg",
    release_date: "2008-07-18",
    vote_average: 8.5,
    vote_count: 32000,
    genre_ids: [28, 80, 18],
    adult: false,
    original_language: "en",
    popularity: 123.456,
  },
  {
    id: 2,
    title: "Inception",
    overview:
      "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible.",
    poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    backdrop_path: "/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
    release_date: "2010-07-16",
    vote_average: 8.4,
    vote_count: 35000,
    genre_ids: [28, 878, 53],
    adult: false,
    original_language: "en",
    popularity: 145.789,
  },
  {
    id: 3,
    title: "Interstellar",
    overview:
      "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdrop_path: "/pbrkL804c8yAv3zBZR4QPWZAAb5.jpg",
    release_date: "2014-11-07",
    vote_average: 8.6,
    vote_count: 34000,
    genre_ids: [18, 878],
    adult: false,
    original_language: "en",
    popularity: 167.234,
  },
  {
    id: 4,
    title: "The Shawshank Redemption",
    overview:
      "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    backdrop_path: "/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
    release_date: "1994-09-23",
    vote_average: 8.7,
    vote_count: 26000,
    genre_ids: [18, 80],
    adult: false,
    original_language: "en",
    popularity: 98.456,
  },
  {
    id: 5,
    title: "Pulp Fiction",
    overview:
      "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.",
    poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    backdrop_path: "/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
    release_date: "1994-09-10",
    vote_average: 8.5,
    vote_count: 27000,
    genre_ids: [80, 18],
    adult: false,
    original_language: "en",
    popularity: 112.789,
  },
  {
    id: 6,
    title: "Forrest Gump",
    overview:
      "The presidencies of Kennedy and Johnson, the Vietnam War, and other historical events unfold from the perspective of an Alabama man with an IQ of 75.",
    poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    backdrop_path: "/7c9UVPPiTPltouxRVY6N9uFiJp0.jpg",
    release_date: "1994-06-23",
    vote_average: 8.5,
    vote_count: 26500,
    genre_ids: [35, 18, 10749],
    adult: false,
    original_language: "en",
    popularity: 105.234,
  },
  {
    id: 7,
    title: "The Matrix",
    overview:
      "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    poster_path: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    backdrop_path: "/icmmSD4vTTDKOq2vvdulafOGw93.jpg",
    release_date: "1999-03-30",
    vote_average: 8.2,
    vote_count: 24000,
    genre_ids: [28, 878],
    adult: false,
    original_language: "en",
    popularity: 134.567,
  },
  {
    id: 8,
    title: "Goodfellas",
    overview:
      "The story of Henry Hill and his life in the mob, covering his relationship with his wife and his partners in crime.",
    poster_path: "/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg",
    backdrop_path: "/sw7mordbZxgITU877yTpZCud90M.jpg",
    release_date: "1990-09-12",
    vote_average: 8.5,
    vote_count: 12000,
    genre_ids: [18, 80],
    adult: false,
    original_language: "en",
    popularity: 87.345,
  },
];

// Fallback function with mock data
export const fetchMoviesWithFallback = async (fetchFunction, ...args) => {
  try {
    const result = await fetchFunction(...args);
    return result;
  } catch (error) {
    console.warn("API request failed, using mock data:", error);
    return {
      results: MOCK_MOVIES.slice(0, 12),
      total_pages: 1,
      total_results: MOCK_MOVIES.length,
      page: 1,
    };
  }
};
