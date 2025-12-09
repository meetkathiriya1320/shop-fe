import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const { token } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [favoritesCount, setFavoritesCount] = useState(0);

  const fetchFavorites = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites || []);
        setFavoritesCount(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFavorites();
    }
  }, [token]);

  const addToFavorites = async (categoryId) => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ categoryId }),
      });
      if (response.ok) {
        const data = await response.json();
        await fetchFavorites();
        return { success: true, data };
      } else {
        const error = await response.json();
        return { success: false, message: error.message };
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return { success: false, message: 'Internal server error' };
    }
  };

  const removeFromFavorites = async (categoryId) => {
    try {
      const response = await fetch(`/api/favorites/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        await fetchFavorites();
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, message: error.message };
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return { success: false, message: 'Internal server error' };
    }
  };

  const checkFavoriteStatus = async (categoryId) => {
    try {
      const response = await fetch(`/api/favorites/check/${categoryId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        return data.isFavorited;
      }
      return false;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  };

  const toggleFavorite = async (categoryId) => {
    try {
      const response = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ categoryId }),
      });
      if (response.ok) {
        const data = await response.json();
        await fetchFavorites();
        return { success: true, data };
      } else {
        const error = await response.json();
        return { success: false, message: error.message };
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return { success: false, message: 'Internal server error' };
    }
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      favoritesCount,
      addToFavorites,
      removeFromFavorites,
      checkFavoriteStatus,
      toggleFavorite,
      fetchFavorites
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};