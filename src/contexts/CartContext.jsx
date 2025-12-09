import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { token } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  const fetchCart = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        // Handle both array response and object with items array
        const items = Array.isArray(data) ? data : data.items || [];
        setCartItems(items);
        setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const fetchCartCount = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/cart/count', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCartCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCart();
    }
  }, [token]);

  const addItem = async (categoryId, quantity = 1) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ categoryId, quantity }),
      });
      if (response.ok) {
        const data = await response.json();
        await fetchCart();
        return { success: true, cartItemId: data.cartItemId };
      } else {
        const error = await response.json();
        return { success: false, message: error.message };
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
      return { success: false, message: 'Internal server error' };
    }
  };

  const updateItemById = async (id, quantity) => {
    try {
      const response = await fetch(`/api/cart/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });
      if (response.ok) {
        await fetchCart();
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, message: error.message };
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      return { success: false, message: 'Internal server error' };
    }
  };

  const updateItemByCategory = async (categoryId, quantity) => {
    try {
      const response = await fetch(`/api/cart/category/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });
      if (response.ok) {
        await fetchCart();
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, message: error.message };
      }
    } catch (error) {
      console.error('Error updating cart item by category:', error);
      return { success: false, message: 'Internal server error' };
    }
  };

  const removeItemById = async (id) => {
    try {
      const response = await fetch(`/api/cart/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        await fetchCart();
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, message: error.message };
      }
    } catch (error) {
      console.error('Error removing cart item:', error);
      return { success: false, message: 'Internal server error' };
    }
  };

  const removeItemByCategory = async (categoryId) => {
    try {
      const response = await fetch(`/api/cart/category/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        await fetchCart();
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, message: error.message };
      }
    } catch (error) {
      console.error('Error removing cart item by category:', error);
      return { success: false, message: 'Internal server error' };
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setCartItems([]);
        setCartCount(0);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, message: error.message };
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false, message: 'Internal server error' };
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      addItem,
      updateItemById,
      updateItemByCategory,
      removeItemById,
      removeItemByCategory,
      clearCart,
      fetchCart,
      fetchCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};