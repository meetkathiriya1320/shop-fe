import React, { createContext, useContext, useState, useEffect } from "react";
import { apiHelpers, endpoints } from "../config/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const saved = localStorage.getItem("isLoggedIn");
    return saved ? JSON.parse(saved) : false;
  });
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem("authToken") || null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    localStorage.setItem("isLoggedIn", JSON.stringify(isLoggedIn));
    localStorage.setItem("user", user ? JSON.stringify(user) : null);
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }, [isLoggedIn, user, token]);

  // Login function with API integration
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiHelpers.post(endpoints.auth.login, credentials);
      const { user: userData, token: authToken } = response.data;

      setIsLoggedIn(true);
      setUser(userData);
      setToken(authToken);

      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Register function with API integration
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiHelpers.post(endpoints.auth.register, userData);
      const { user: newUser, token: authToken } = response.data;

      setIsLoggedIn(true);
      setUser(newUser);
      setToken(authToken);

      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Registration failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function with API integration
  const logout = async () => {
    try {
      await apiHelpers.post(endpoints.auth.logout);
    } catch (err) {
      console.error("Logout API call failed:", err);
    } finally {
      setIsLoggedIn(false);
      setUser(null);
      setToken(null);
      setError(null);
    }
  };

  // Get user profile from API
  const getProfile = async () => {
    if (!token) return;

    try {
      const response = await apiHelpers.get(endpoints.auth.profile);
      setUser(response.data);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  // Check if user is authenticated on app start
  useEffect(() => {
    if (token && !user) {
      getProfile();
    }
  }, [token]);

  const value = {
    isLoggedIn,
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    getProfile,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
