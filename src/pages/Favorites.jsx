import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';

const Favorites = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { favorites, removeFromFavorites } = useFavorites();
  const [loading, setLoading] = useState(false);

  const handleRemoveFavorite = async (categoryId) => {
    setLoading(true);
    const result = await removeFromFavorites(categoryId);
    if (!result.success) {
      alert(result.message);
    }
    setLoading(false);
  };

  if (!isLoggedIn) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate('/')}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold">My Favorites</h1>
          </div>

          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-600 mb-4">No favorites yet</h2>
              <p className="text-gray-500 mb-8">Start adding items to your favorites!</p>
              <button
                onClick={() => navigate('/')}
                className="bg-[#111] hover:bg-gray-800 text-white font-bold py-3 px-6 rounded transition-colors duration-300"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((favorite, index) => (
                <motion.div
                  key={favorite.id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={() => navigate('/category-details', { state: { product: favorite.category } })}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={favorite.category?.images?.[0] ? `http://localhost:3001${favorite.category.images[0]}` : '/placeholder-image.jpg'}
                      alt={favorite.category?.name}
                      className="w-full h-64 object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFavorite(favorite.categoryId);
                      }}
                      disabled={loading}
                      className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{favorite.category?.name}</h3>
                    <p className="text-gray-600 mb-4">₹{favorite.category?.price}</p>
                    <motion.button
                      className="w-full bg-[#111] hover:bg-gray-800 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/category-details', { state: { product: favorite.category } });
                      }}
                    >
                      View Details
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Favorites;