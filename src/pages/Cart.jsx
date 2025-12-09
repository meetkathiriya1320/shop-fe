import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Cart = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const {
    cartItems,
    updateItemById,
    removeItemById,
    clearCart
  } = useCart();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  const handleQuantityChange = async (id, newQuantity) => {
    if (newQuantity < 0) return;
    setLoading(true);
    const result = await updateItemById(id, newQuantity);
    if (!result.success) {
      alert(result.message);
    }
    setLoading(false);
  };

  const handleRemoveItem = async (id) => {
    setLoading(true);
    const result = await removeItemById(id);
    if (!result.success) {
      alert(result.message);
    }
    setLoading(false);
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      setLoading(true);
      const result = await clearCart();
      if (!result.success) {
        alert(result.message);
      }
      setLoading(false);
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.subtotal || ((item.category?.price || item.price) * item.quantity)), 0);

  // Remove the early return to allow rendering even when checking auth

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate('/')}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v8a2 2 0 002 2h10a2 2 0 002-2v-3" />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-600 mb-4">Your cart is empty</h2>
              <p className="text-gray-500 mb-8">Add some items to get started!</p>
              <button
                onClick={() => navigate('/')}
                className="bg-[#111] hover:bg-gray-800 text-white font-bold py-3 px-6 rounded transition-colors duration-300"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-8">
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.category?.images?.[0] ? `http://localhost:3001${item.category.images[0]}` : '/placeholder-image.jpg'}
                        alt={item.category?.name || item.name}
                        className="w-20 h-20 object-cover rounded cursor-pointer"
                        onClick={() => navigate('/category-details', { state: { product: item.category } })}
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 cursor-pointer" onClick={() => navigate('/category-details', { state: { product: item.category } })}>{item.category?.name || item.name}</h3>
                        <p className="text-gray-600">₹{item.category?.price || item.price}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuantityChange(item.id, item.quantity - 1);
                          }}
                          disabled={loading}
                          className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuantityChange(item.id, item.quantity + 1);
                          }}
                          disabled={loading}
                          className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">₹{item.subtotal || ((item.category?.price || item.price) * item.quantity)}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveItem(item.id);
                          }}
                          disabled={loading}
                          className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Total: ₹{totalPrice}</h2>
                  <button
                    onClick={handleClearCart}
                    disabled={loading}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50"
                  >
                    Clear Cart
                  </button>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => navigate('/')}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded transition-colors duration-300"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={() => navigate('/checkout')}
                    className="flex-1 bg-[#111] hover:bg-gray-800 text-white font-bold py-3 px-6 rounded transition-colors duration-300"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;