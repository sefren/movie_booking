import React, { useState, useEffect, useRef } from 'react';

const LazyImage = ({
  src,
  alt,
  className = '',
  placeholder = '/placeholder-movie-poster.jpg',
  onError,
  loading = 'lazy',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    // Reset states when src changes
    setImageLoading(true);
    setImageError(false);

    // Create a new image object for preloading
    const img = new Image();

    img.onload = () => {
      setImageSrc(src);
      setImageLoading(false);
    };

    img.onerror = () => {
      setImageError(true);
      setImageLoading(false);
      if (onError) onError();
    };

    // Start loading
    if (src && src !== placeholder) {
      img.src = src;
    } else {
      setImageLoading(false);
    }

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, placeholder, onError]);

  return (
    <div className={`relative ${className}`}>
      {/* Skeleton loader */}
      {imageLoading && (
        <div className="absolute inset-0 bg-white/5 animate-pulse" />
      )}

      {/* Actual image */}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        loading={loading}
        decoding="async"
        className={`${className} ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        {...props}
      />
    </div>
  );
};

export default LazyImage;

