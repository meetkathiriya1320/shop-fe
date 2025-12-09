import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import LoginModal from './LoginModal';

const Header = () => {
  const { isLoggedIn, user, login, logout } = useAuth();
  const { cartCount } = useCart();
  const { favoritesCount } = useFavorites();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const navLinks = ['About', 'Login'];

  return (
    <motion.header
      className="w-full z-50 bg-white shadow-lg transition-all duration-300"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-orange-600">SKY VIEW JEANS+ </div>
        <nav className="hidden md:flex space-x-6">
          {navLinks.map((link) => {
            if (link === 'Login') {
              return !isLoggedIn ? (
                <button
                  key={link}
                  onClick={() => setIsModalOpen(true)}
                  className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
                >
                  {link}
                </button>
              ) : null;
            }
            return (
              <a
                key={link}
                href="#"
                className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
              >
                {link}
              </a>
            );
          })}
          {isLoggedIn && (
            <>
              <button
                onClick={() => navigate('/favorites')}
                className="text-gray-700 hover:text-gray-900 transition-colors duration-200 relative"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {favoritesCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {favoritesCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="text-gray-700 hover:text-gray-900 transition-colors duration-200 relative"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v8a2 2 0 002 2h10a2 2 0 002-2v-3" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate('/orders')}
                className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
              >
                Orders
              </button>
              <button
                onClick={() => {
                  // Simulate logout
                  setTimeout(() => {
                    logout();
                  }, 500);
                }}
                className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
              >
                Logout
              </button>
            </>
          )}
        </nav>
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      {isMobileMenuOpen && (
        <motion.div
          className="md:hidden bg-white shadow-lg"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="px-4 py-2 space-y-2">
            {navLinks.map((link) => {
              if (link === 'Login') {
                return !isLoggedIn ? (
                  <button
                    key={link}
                    onClick={() => {
                      setIsModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="block text-gray-700 hover:text-gray-900 py-2 w-full text-left"
                  >
                    {link}
                  </button>
                ) : null;
              }
              return (
                <a
                  key={link}
                  href="#"
                  className="block text-gray-700 hover:text-gray-900 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link}
                </a>
              );
            })}
            {isLoggedIn && (
              <>
                <button
                  onClick={() => {
                    navigate('/favorites');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block text-gray-700 hover:text-gray-900 py-2 w-full text-left"
                >
                  <svg className="w-6 h-6 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Favorites {favoritesCount > 0 && `(${favoritesCount})`}
                </button>
                <button
                  onClick={() => {
                    navigate('/cart');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block text-gray-700 hover:text-gray-900 py-2 w-full text-left"
                >
                  <svg className="w-6 h-6 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v8a2 2 0 002 2h10a2 2 0 002-2v-3" />
                  </svg>
                  Cart {cartCount > 0 && `(${cartCount})`}
                </button>
                <button
                  onClick={() => {
                    navigate('/orders');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block text-gray-700 hover:text-gray-900 py-2 w-full text-left"
                >
                  Orders
                </button>
                <button
                  onClick={() => {
                    // Simulate logout
                    setTimeout(() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }, 500);
                  }}
                  className="block text-gray-700 hover:text-gray-900 py-2 w-full text-left"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </motion.header>
  );
};

export default Header;