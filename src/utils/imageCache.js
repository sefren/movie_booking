// Image caching and preloading utilities

// In-memory cache for loaded images
const imageCache = new Set();

/**
 * Preload images to browser cache
 * @param {string[]} urls - Array of image URLs to preload
 */
export const preloadImages = (urls) => {
  if (!Array.isArray(urls)) return;

  urls.forEach(url => {
    if (!url || imageCache.has(url)) return;

    const img = new Image();
    img.onload = () => imageCache.add(url);
    img.onerror = () => console.warn(`Failed to preload image: ${url}`);
    img.src = url;
  });
};

/**
 * Check if image is cached
 * @param {string} url - Image URL
 * @returns {boolean}
 */
export const isImageCached = (url) => {
  return imageCache.has(url);
};

/**
 * Clear image cache
 */
export const clearImageCache = () => {
  imageCache.clear();
};

/**
 * Preload movie posters in batches
 * @param {Array} movies - Array of movie objects
 * @param {number} batchSize - Number of images to preload at once
 */
export const preloadMoviePosters = (movies, batchSize = 10) => {
  if (!Array.isArray(movies)) return;

  const posterUrls = movies
    .slice(0, batchSize)
    .map(movie => {
      if (movie.posterPath) {
        return `https://image.tmdb.org/t/p/w500${movie.posterPath}`;
      }
      return null;
    })
    .filter(Boolean);

  preloadImages(posterUrls);
};

/**
 * Get optimized image URL based on viewport width
 * @param {string} path - TMDB image path
 * @param {string} size - Size variant (small, medium, large)
 * @returns {string}
 */
export const getOptimizedImageUrl = (path, size = 'medium') => {
  if (!path) return '/placeholder-movie-poster.jpg';

  const sizes = {
    small: 'w185',
    medium: 'w342',
    large: 'w500',
    xlarge: 'w780',
    original: 'original'
  };

  const tmdbSize = sizes[size] || sizes.medium;
  return `https://image.tmdb.org/t/p/${tmdbSize}${path}`;
};

/**
 * Lazy load images when they enter viewport
 * Uses Intersection Observer API
 */
export class LazyLoader {
  constructor(options = {}) {
    this.options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.01,
      ...options
    };

    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      this.options
    );
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.dataset.src;

        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          this.observer.unobserve(img);
        }
      }
    });
  }

  observe(element) {
    this.observer.observe(element);
  }

  disconnect() {
    this.observer.disconnect();
  }
}

// Create a singleton instance
export const lazyLoader = new LazyLoader();

