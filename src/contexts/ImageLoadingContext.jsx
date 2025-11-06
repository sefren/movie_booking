import React, { createContext, useContext, useState, useEffect } from 'react';

const ImageLoadingContext = createContext();

export const useImageLoading = () => {
  const context = useContext(ImageLoadingContext);
  if (!context) {
    throw new Error('useImageLoading must be used within ImageLoadingProvider');
  }
  return context;
};

export const ImageLoadingProvider = ({ children, delay = 100 }) => {
  const [enableImageLoading, setEnableImageLoading] = useState(false);
  const [contentReady, setContentReady] = useState(false);

  useEffect(() => {
    // Mark content as ready immediately
    setContentReady(true);

    // Enable image loading after a short delay to let text render first
    const timer = setTimeout(() => {
      setEnableImageLoading(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <ImageLoadingContext.Provider value={{ enableImageLoading, contentReady }}>
      {children}
    </ImageLoadingContext.Provider>
  );
};

