// Auth API utilities for frontend
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: getAuthHeaders(),
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Auth API request failed:", error);
    throw error;
  }
};

// Register new user
export const registerUser = async (userData) => {
  try {
    const response = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message || "Registration failed");
  }
};

// Login user
export const loginUser = async (credentials) => {
  try {
    const response = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message || "Login failed");
  }
};

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await apiRequest("/auth/profile");
    return response.data;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch profile");
  }
};

// Update user profile
export const updateUserProfile = async (userData) => {
  try {
    const response = await apiRequest("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message || "Failed to update profile");
  }
};

// Change password
export const changePassword = async (passwords) => {
  try {
    const response = await apiRequest("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(passwords),
    });
    return response;
  } catch (error) {
    throw new Error(error.message || "Failed to change password");
  }
};

// Get user bookings
export const getUserBookings = async () => {
  try {
    const response = await apiRequest("/auth/bookings");
    return response.data;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch bookings");
  }
};

// Validate token
export const validateToken = async () => {
  try {
    const response = await apiRequest("/auth/profile");
    return response.success;
  } catch (error) {
    return false;
  }
};

export default {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUserBookings,
  validateToken,
};
