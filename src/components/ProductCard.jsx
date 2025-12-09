import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';

const ProductCard = ({ product, index }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { token } = useAuth();
  const { addItem } = useCart();
  const { toggleFavorite, checkFavoriteStatus } = useFavorites();
  const navigate = useNavigate();

  useEffect(() => {
    const checkFavorite = async () => {
      if (token && product.id) {
        const isFavorited = await checkFavoriteStatus(product.id);
        setIsWishlisted(isFavorited);
      }
    };
    checkFavorite();
  }, [token, product.id, checkFavoriteStatus]);

  const handleProductClick = async () => {
    try {
      const response = await fetch('/api/categories/names', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: product.name }),
      });
      if (response.ok) {
        console.log('API call successful');
        navigate('/category-details', { state: { product } });
      } else {
        console.error('API call failed');
      }
    } catch (error) {
      console.error('Error calling API:', error);
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    const result = await addItem(product.id);
    if (result.success) {
      // Show success message or update UI
      console.log('Item added to cart successfully');
    } else {
      alert(result.message);
    }
  };

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    const result = await toggleFavorite(product.id);
    if (result.success) {
      setIsWishlisted(result.data.isFavorited);
    } else {
      alert(result.message);
    }
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onClick={handleProductClick}
    >
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-64 object-cover transition-transform duration-300 hover:scale-105"
        />
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors duration-200"
          onClick={handleToggleFavorite}
        >
          <svg className="w-6 h-6" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
        <p className="text-gray-600 mb-4">₹{product.price}</p>
      </div>
    </motion.div>
  );
};

export default ProductCard;