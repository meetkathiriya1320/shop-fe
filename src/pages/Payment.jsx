import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const { clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    if (location.state?.orderId) {
      setOrderId(location.state.orderId);
    }
  }, [location.state]);

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let paymentDetails = {};

      if (paymentMethod === 'card') {
        const [expiryMonth, expiryYear] = cardDetails.expiryDate.split('/');
        paymentDetails = {
          cardNumber: cardDetails.cardNumber.replace(/\s/g, ''),
          expiryMonth,
          expiryYear,
          cvv: cardDetails.cvv
        };
      } else if (paymentMethod === 'upi') {
        paymentDetails = { upiId };
      } else if (paymentMethod === 'cod') {
        paymentDetails = { method: 'cash_on_delivery' };
      }

      // Process payment
      const paymentResponse = await fetch('/api/orders/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          orderId,
          paymentDetails
        }),
      });

      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        // Clear the cart after successful payment
        await clearCart();
        // Navigate to home page without popup
        navigate('/');
      } else {
        const errorData = await paymentResponse.json().catch(() => ({}));
        alert(`Payment failed: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error processing payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Payment</h1>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Select Payment Method</h2>

            <div className="space-y-4 mb-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <span>Credit/Debit Card</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <span>UPI</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <span>Cash on Delivery</span>
              </label>
            </div>

            <form onSubmit={handleSubmit}>
              {paymentMethod === 'card' && (
                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-medium">Card Details</h3>
                  <div>
                    <label htmlFor="cardholderName" className="block text-gray-700 mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      id="cardholderName"
                      name="cardholderName"
                      value={cardDetails.cardholderName}
                      onChange={handleCardInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="cardNumber" className="block text-gray-700 mb-2">Card Number</label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={cardDetails.cardNumber}
                      onChange={handleCardInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiryDate" className="block text-gray-700 mb-2">Expiry Date</label>
                      <input
                        type="text"
                        id="expiryDate"
                        name="expiryDate"
                        value={cardDetails.expiryDate}
                        onChange={handleCardInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="MM/YY"
                        maxLength="5"
                      />
                    </div>
                    <div>
                      <label htmlFor="cvv" className="block text-gray-700 mb-2">CVV</label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        value={cardDetails.cvv}
                        onChange={handleCardInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="123"
                        maxLength="4"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-medium">UPI Details</h3>
                  <div>
                    <label htmlFor="upiId" className="block text-gray-700 mb-2">UPI ID</label>
                    <input
                      type="text"
                      id="upiId"
                      name="upiId"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="yourname@upi"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-yellow-800">
                    <strong>Cash on Delivery:</strong> Pay when your order is delivered to your doorstep.
                  </p>
                </div>
              )}

              <div className="flex space-x-4">
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
                  {loading ? 'Processing...' : 'Pay Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Payment;