import React, { createContext, useState, useEffect, useContext } from "react";
import * as backendApi from "../utils/backendApi";

const AuthContext = createContext(null);

// Custom hook
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = backendApi.getCurrentUser();
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setUser(storedUser);
      loadFavorites();
    } else {
      backendApi.logout();
    }
    setLoading(false);
  }, []);

  // Load user favorites
  const loadFavorites = async () => {
    try {
      const userFavorites = await backendApi.getFavorites();
      setFavorites(userFavorites || []);
    } catch (error) {
      console.error("❌ Failed to load favorites:", error.message);

      // If token is invalid/expired or user not found, logout the user
      if (error.message && (error.message.includes('token') || error.message.includes('User not found'))) {
        backendApi.logout();
        setUser(null);
        setFavorites([]);
      }
      setFavorites([]);
    }
  };

  // Login with backend
  const login = async (email, password) => {
    try {
      const response = await backendApi.login(email, password);
      setUser(response.user);
      if (response.user.favorites) {
        setFavorites(response.user.favorites);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Register with backend
  const register = async (userData) => {
    try {
      const response = await backendApi.register(userData);
      setUser(response.user);
      setFavorites([]);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Logout
  const logout = () => {
    backendApi.logout();
    setUser(null);
    setFavorites([]);
  };

  // Update user profile
  const updateUser = async (userData) => {
    try {
      const updatedUser = await backendApi.updateProfile(userData);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  // Add to favorites
  const addToFavorites = async (movieId) => {
    try {
      await backendApi.addFavorite(movieId);
      // Reload favorites to get full movie object
      await loadFavorites();
      return true;
    } catch (error) {
      console.error("Failed to add favorite:", error);
      return false;
    }
  };

  // Remove from favorites
  const removeFromFavorites = async (movieId) => {
    try {
      await backendApi.removeFavorite(movieId);
      // Remove from local state
      setFavorites(prev => prev.filter(fav => (fav._id || fav.id || fav) !== movieId));
      return true;
    } catch (error) {
      console.error("Failed to remove favorite:", error);
      return false;
    }
  };

  // Check if movie is favorited
  const isFavorite = (movieId) => {
    return favorites.some(fav => {
      const favId = fav._id || fav.id || fav;
      return favId === movieId || favId.toString() === movieId.toString();
    });
  };

  // Toggle favorite
  const toggleFavorite = async (movieId) => {
    if (isFavorite(movieId)) {
      return await removeFromFavorites(movieId);
    } else {
      return await addToFavorites(movieId);
    }
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const value = {
    user,
    loading,
    favorites,
    login,
    register,
    logout,
    updateUser,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    isAuthenticated,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

