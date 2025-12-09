import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [address, setAddress] = useState({
    addressStreet: '',
    addressCity: '',
    addressState: '',
    addressZip: '',
    addressCountry: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(true);

  useEffect(() => {
    const fetchShippingAddress = async () => {
      if (!token) return;
      try {
        const response = await fetch('/api/auth/address', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const addressData = await response.json();
          // Handle both direct address object and nested shippingAddress object
          const shippingAddress = addressData.shippingAddress || addressData;
          setAddress({
            addressStreet: shippingAddress.addressStreet || '',
            addressCity: shippingAddress.addressCity || '',
            addressState: shippingAddress.addressState || '',
            addressZip: shippingAddress.addressZip || '',
            addressCountry: shippingAddress.addressCountry || ''
          });
        }
      } catch (error) {
        console.error('Error fetching shipping address:', error);
      } finally {
        setLoadingAddress(false);
      }
    };

    fetchShippingAddress();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // First save the address
      const addressResponse = await fetch('/api/auth/address', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(address),
      });

      if (!addressResponse.ok) {
        const errorData = await addressResponse.json().catch(() => ({}));
        alert(`Failed to save address: ${errorData.message || 'Unknown error'}`);
        setLoading(false);
        return;
      }

      // Then checkout the cart
      const checkoutResponse = await fetch('/api/cart/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          paymentMethod: 'credit_card', // Default, will be updated in payment step
          shippingAddressStreet: address.addressStreet,
          shippingAddressCity: address.addressCity,
          shippingAddressState: address.addressState,
          shippingAddressZip: address.addressZip,
          shippingAddressCountry: address.addressCountry
        }),
      });

      if (checkoutResponse.ok) {
        const checkoutData = await checkoutResponse.json();
        // Don't show alert popup, just proceed to payment
        // Pass orderId to payment page
        navigate('/payment', { state: { orderId: checkoutData.orderId } });
      } else {
        const errorData = await checkoutResponse.json().catch(() => ({}));
        alert(`Failed to checkout: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Error during checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>
          {loadingAddress ? (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <p>Loading shipping address...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="addressStreet" className="block text-gray-700 mb-2">Street Address</label>
                <input
                  type="text"
                  id="addressStreet"
                  name="addressStreet"
                  value={address.addressStreet}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter your street address"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="addressCity" className="block text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    id="addressCity"
                    name="addressCity"
                    value={address.addressCity}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter your city"
                  />
                </div>
                <div>
                  <label htmlFor="addressState" className="block text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    id="addressState"
                    name="addressState"
                    value={address.addressState}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter your state"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="addressZip" className="block text-gray-700 mb-2">ZIP Code</label>
                  <input
                    type="text"
                    id="addressZip"
                    name="addressZip"
                    value={address.addressZip}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter your ZIP code"
                  />
                </div>
                <div>
                  <label htmlFor="addressCountry" className="block text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    id="addressCountry"
                    name="addressCountry"
                    value={address.addressCountry}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter your country"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 bg-gray-500 text-white py-3 px-6 rounded hover:bg-gray-600 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-orange-600 text-white py-3 px-6 rounded hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;