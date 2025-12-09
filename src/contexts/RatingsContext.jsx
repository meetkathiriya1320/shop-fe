import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const RatingsContext = createContext();

export const useRatings = () => {
  const context = useContext(RatingsContext);
  if (!context) {
    throw new Error('useRatings must be used within a RatingsProvider');
  }
  return context;
};

export const RatingsProvider = ({ children }) => {
  const { token } = useAuth();
  const [ratings, setRatings] = useState({});

  const addRating = async (categoryId, rating, review = '') => {
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ categoryId, rating, review }),
      });
      if (response.ok) {
        const data = await response.json();
        // Update local state
        setRatings(prev => ({
          ...prev,
          [categoryId]: { ...data.rating, userRating: true }
        }));
        return { success: true, data };
      } else {
        const error = await response.json();
        return { success: false, message: error.message };
      }
    } catch (error) {
      console.error('Error adding rating:', error);
      return { success: false, message: 'Internal server error' };
    }
  };

  const updateRating = async (ratingId, rating, review = '') => {
    try {
      const response = await fetch(`/api/ratings/${ratingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, review }),
      });
      if (response.ok) {
        // Refresh the category ratings
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, message: error.message };
      }
    } catch (error) {
      console.error('Error updating rating:', error);
      return { success: false, message: 'Internal server error' };
    }
  };

  const deleteRating = async (ratingId) => {
    try {
      const response = await fetch(`/api/ratings/${ratingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, message: error.message };
      }
    } catch (error) {
      console.error('Error deleting rating:', error);
      return { success: false, message: 'Internal server error' };
    }
  };

  const getCategoryRatings = async (categoryId) => {
    try {
      const response = await fetch(`/api/ratings/category/${categoryId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setRatings(prev => ({
          ...prev,
          [categoryId]: data
        }));
        return { success: true, data };
      } else {
        return { success: false, message: 'Failed to fetch ratings' };
      }
    } catch (error) {
      console.error('Error fetching category ratings:', error);
      return { success: false, message: 'Internal server error' };
    }
  };

  const getUserRatingForCategory = async (categoryId) => {
    try {
      const response = await fetch(`/api/ratings/user/${categoryId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        return { success: true, rating: data.rating };
      } else {
        return { success: false, message: 'Failed to fetch user rating' };
      }
    } catch (error) {
      console.error('Error fetching user rating:', error);
      return { success: false, message: 'Internal server error' };
    }
  };

  return (
    <RatingsContext.Provider value={{
      ratings,
      addRating,
      updateRating,
      deleteRating,
      getCategoryRatings,
      getUserRatingForCategory
    }}>
      {children}
    </RatingsContext.Provider>
  );
};