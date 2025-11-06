import React, { useState, useEffect, useRef } from 'react';
import { useImageLoading } from '../contexts/ImageLoadingContext';

const LazyImage = ({
  src,
  alt,
  className = '',
  placeholder = '/placeholder-movie-poster.jpg',
  onError,
  loading = 'lazy',
  width,
  height,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageLoading, setImageLoading] = useState(true);
  const imgRef = useRef(null);
  const { enableImageLoading } = useImageLoading();

  useEffect(() => {
    // Don't start loading images until text content is rendered
    if (!enableImageLoading) {
      return;
    }

    // Reset states when src changes
    setImageLoading(true);

    // Create a new image object for preloading
    const img = new Image();

    img.onload = () => {
      setImageSrc(src);
      setImageLoading(false);
    };

    img.onerror = () => {
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
  }, [src, placeholder, onError, enableImageLoading]);

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
        alt={alt}        width={width}
        height={height}
        loading={loading}
        decoding="async"
        className={`${className} ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        {...props}
      />
    </div>
  );
};

export default LazyImage;

