import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRatings } from '../contexts/RatingsContext';
import { useCart } from '../contexts/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoginModal from '../components/LoginModal';

const CategoryDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { productId } = useParams();
  const { token, user } = useAuth();
  const { getCategoryRatings, getUserRatingForCategory, addRating, updateRating, deleteRating } = useRatings();
  const { addItem } = useCart();
  const product = location.state?.product;
  const [productDetails, setProductDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ratings, setRatings] = useState(null);
  const [userRating, setUserRating] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingsPerDetail, setRatingsPerDetail] = useState({});
  const [userRatingPerDetail, setUserRatingPerDetail] = useState({});
  const [currentDetailForModal, setCurrentDetailForModal] = useState(null);
  const [currentRatingId, setCurrentRatingId] = useState(null);
  const [isUpdate, setIsUpdate] = useState(false);
  const [showAllReviewsForProduct, setShowAllReviewsForProduct] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const product = location.state?.product;
    if (product) {
      fetchCategories(product.name);
      loadRatings(product.id);
    } else if (productId) {
      // Fetch product details using productId from URL
      fetchProductById(productId);
    } else {
      // Show a message for direct access without parameters
      setLoading(false);
      setError('Please select a product from the main page to view details.');
    }
  }, [location.state, productId, token]);

  useEffect(() => {
    if (productDetails.length > 0) {
      productDetails.forEach(detail => {
        loadRatingsForDetail(detail.id);
      });
    }
  }, [productDetails, token]);

  const loadRatings = async (categoryId) => {
    if (token && categoryId) {
      const ratingsResult = await getCategoryRatings(categoryId);
      if (ratingsResult.success) {
        setRatings(ratingsResult.data);
      }
      const userRatingResult = await getUserRatingForCategory(categoryId);
      if (userRatingResult.success) {
        setUserRating(userRatingResult.rating);
        if (userRatingResult.rating) {
          setRatingValue(userRatingResult.rating.rating);
          setReviewText(userRatingResult.rating.review || '');
        }
      }
    }
  };

  const loadRatingsForDetail = async (detailId) => {
    if (token && detailId) {
      try {
        const ratingsResult = await getCategoryRatings(detailId);
        const userRatingResult = await getUserRatingForCategory(detailId);
        console.log('API Response for detail', detailId, ':', ratingsResult);
        setRatingsPerDetail(prev => ({ ...prev, [detailId]: ratingsResult.success ? ratingsResult.data : null }));
        setUserRatingPerDetail(prev => ({ ...prev, [detailId]: userRatingResult.success ? userRatingResult.rating : null }));
      } catch (error) {
        console.error('Error loading ratings for detail:', error);
      }
    }
  };

  const fetchCategories = async (productName) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/categories/names', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ name: productName }),
      });
      if (response.ok) {
        const data = await response.json();
        setProductDetails(data.categories || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(`Failed to fetch categories: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Error fetching categories. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductById = async (id) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/products/${id}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });
      if (response.ok) {
        const product = await response.json();
        setProductDetails([product] || []);
        loadRatings(product.id);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(`Failed to fetch product: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Error fetching product. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!currentDetailForModal) return;

    setRatingLoading(true);
    try {
      let result;
      if (isUpdate && currentRatingId) {
        // Update existing rating
        result = await updateRating(currentRatingId, ratingValue, reviewText);
      } else {
        // Add new rating
        result = await addRating(currentDetailForModal.id, ratingValue, reviewText);
      }

      if (result.success) {
        setShowRatingModal(false);
        await loadRatingsForDetail(currentDetailForModal.id); // Refresh ratings
        setCurrentDetailForModal(null);
        setCurrentRatingId(null);
        setIsUpdate(false);
        setRatingValue(5);
        setReviewText('');
      } else {
        alert(result.message || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Error submitting rating. Please try again.');
    } finally {
      setRatingLoading(false);
    }
  };


  const renderStars = (rating, interactive = false, onChange = null) => {
    const fullStars = Math.floor(rating);
    const fractional = rating - fullStars;
    const hasHalf = fractional >= 0.5;
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFull = star <= fullStars;
          const isHalf = star === fullStars + 1 && hasHalf;
          const isEmpty = !isFull && !isHalf;
          let style = {};
          let color = '';
          if (isFull) {
            color = '#fbbf24';
          } else if (isHalf) {
            style = {
              background: 'linear-gradient(to right, #fbbf24 50%, #d1d5db 50%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent'
            };
          } else {
            color = '#d1d5db';
          }
          return (
            <span
              key={star}
              className={`text-2xl ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
              style={{ color, ...style }}
              onClick={interactive && onChange ? () => onChange(star) : undefined}
            >
              ★
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => window.history.back()}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">Product Details</h1>
        </div>
        {product && productDetails && productDetails.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8">{product.name} Variants</h1>

            <div className="space-y-8">
              {productDetails.map((detail, index) => (
                <div key={detail.id || index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-1/3 p-6">
                      <div className="relative">
                        {(() => {
                          const images = (detail.images && detail.images.length > 0 ? detail.images : [detail.image]).filter(Boolean);
                          const currentImgSrc = images[currentImageIndex] || images[0];
                          return (
                            <>
                              <img
                                src={currentImgSrc.startsWith('http') ? currentImgSrc : `http://localhost:3001${currentImgSrc}`}
                                alt={`${detail.name} ${currentImageIndex + 1}`}
                                className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => {
                                  setCurrentImage(currentImgSrc.startsWith('http') ? currentImgSrc : `http://localhost:3001${currentImgSrc}`);
                                  setShowImageModal(true);
                                }}
                              />
                              {images.length > 1 && (
                                <>
                                  <button
                                    onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                                  >
                                    ‹
                                  </button>
                                  <button
                                    onClick={() => setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                                  >
                                    ›
                                  </button>
                                  <div className="flex justify-center mt-2 space-x-1">
                                    {images.map((_, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-orange-600' : 'bg-gray-300'}`}
                                      />
                                    ))}
                                  </div>
                                </>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="md:w-2/3 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-gray-800">{detail.name}</h3>
                        {token ? (
                          <button
                            onClick={() => {
                              setCurrentDetailForModal(detail);
                              setRatingValue(userRatingPerDetail[detail.id]?.rating || 5);
                              setReviewText(userRatingPerDetail[detail.id]?.review || '');
                              setCurrentRatingId(userRatingPerDetail[detail.id]?.id || null);
                              setIsUpdate(!!userRatingPerDetail[detail.id]);
                              setShowRatingModal(true);
                            }}
                            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors text-sm font-medium"
                          >
                            {userRatingPerDetail[detail.id] ? 'Update Review' : 'Add Review'}
                          </button>
                        ) : (
                          <button
                            onClick={() => setShowLoginModal(true)}
                            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors text-sm font-medium"
                          >
                            Add Review
                          </button>
                        )}
                      </div>
                      <p className="text-2xl text-orange-600 font-semibold mb-2">₹{detail.price}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                        {detail.size && <p className="text-gray-700"><span className="font-medium">Size:</span> {detail.size}</p>}
                        {detail.material && <p className="text-gray-700"><span className="font-medium">Material:</span> {detail.material}</p>}
                        {detail.color && <p className="text-gray-700"><span className="font-medium">Color:</span> {detail.color}</p>}
                        {detail.created_at && <p className="text-gray-700"><span className="font-medium">Created At:</span> {new Date(detail.created_at).toLocaleDateString()}</p>}
                        {detail.description && <p className="text-gray-700 md:col-span-2"><span className="font-medium">Description:</span> {detail.description}</p>}
                      </div>

                      {/* Individual Product Rating Section */}
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Rate this product:</span>
                          {token ? (
                            <button
                              onClick={() => {
                                setCurrentDetailForModal(detail);
                                setRatingValue(userRatingPerDetail[detail.id]?.rating || 5);
                                setReviewText(userRatingPerDetail[detail.id]?.review || '');
                                setCurrentRatingId(userRatingPerDetail[detail.id]?.id || null);
                                setIsUpdate(!!userRatingPerDetail[detail.id]);
                                setShowRatingModal(true);
                              }}
                              className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                            >
                              {userRatingPerDetail[detail.id] ? 'Update Review' : 'Add Review'}
                            </button>
                          ) : (
                            <button
                              onClick={() => setShowLoginModal(true)}
                              className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                            >
                              Add Review
                            </button>
                          )}
                        </div>
                        {ratingsPerDetail[detail.id]?.statistics?.totalRatings > 0 && (
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Average rating:</span>
                              {renderStars(parseFloat(ratingsPerDetail[detail.id].statistics.averageRating), false)}
                            </div>
                            <button
                              onClick={async () => {
                                // Call the API to get fresh reviews data
                                await loadRatingsForDetail(detail.id);
                                // Also call user rating API
                                await getUserRatingForCategory(detail.id);
                                setShowAllReviewsForProduct(prev => ({ ...prev, [detail.id]: !prev[detail.id] }));
                              }}
                              className="text-blue-600 hover:text-blue-700 underline text-sm"
                            >
                              {showAllReviewsForProduct[detail.id] ? 'Hide reviews' : 'See all reviews'}
                            </button>
                          </div>
                        )}

                        {/* Show all reviews for this product when toggled */}
                        {showAllReviewsForProduct[detail.id] && ratingsPerDetail[detail.id] && ratingsPerDetail[detail.id].ratings && ratingsPerDetail[detail.id].ratings.length > 0 && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-medium text-gray-700">All Reviews:</h4>
                            </div>
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                              {ratingsPerDetail[detail.id].ratings.map((review, reviewIndex) => (
                                <div key={reviewIndex} className="border-b border-gray-200 pb-3 last:border-b-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs font-medium text-gray-700">{review.userName || 'User'}</span>
                                      {renderStars(review.rating, false)}
                                      <span className="text-xs text-gray-500">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                      </span>
                                      {user && user.id === review.userId && (
                                        <button
                                          onClick={() => {
                                            setCurrentDetailForModal(detail);
                                            setRatingValue(review.rating);
                                            setReviewText(review.review || '');
                                            setCurrentRatingId(review.id);
                                            setIsUpdate(true);
                                            setShowRatingModal(true);
                                          }}
                                          className="text-xs text-blue-600 hover:text-blue-700 underline"
                                        >
                                          Update
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  {review.review && (
                                    <p className="text-sm text-gray-700 mt-1">{review.review}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Show message if no reviews when trying to see all reviews */}
                        {showAllReviewsForProduct[detail.id] && (!ratingsPerDetail[detail.id] || !ratingsPerDetail[detail.id].ratings || ratingsPerDetail[detail.id].ratings.length === 0) && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">No reviews available for this product.</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-4">
                        <input
                          type="number"
                          min="1"
                          defaultValue="1"
                          id={`quantity-${detail.id}`}
                          className="w-20 p-2 border border-gray-300 rounded"
                        />
                        <button
                          onClick={async () => {
                            const quantityInput = document.getElementById(`quantity-${detail.id}`);
                            const quantity = parseInt(quantityInput.value) || 1;
                            const result = await addItem(detail.id, quantity);
                            if (result.success) {
                              console.log('Item added to cart successfully');
                            } else {
                              alert(result.message);
                            }
                          }}
                          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {loading && <p className="text-gray-600 text-center py-8">Loading categories...</p>}
        {error && (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 transition-colors"
            >
              Go to Home Page
            </button>
          </div>
        )}
        {!loading && !error && (!productDetails || productDetails.length === 0) && (
          <p className="text-gray-600 text-center py-8">No product details found.</p>
        )}
      </main>

      {/* Rating Modal */}
      {showRatingModal && currentDetailForModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {isUpdate ? 'Update Review' : 'Add Review'}
            </h2>
            <form onSubmit={handleSubmitRating}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Rating</label>
                <div className="flex justify-center">
                  {renderStars(ratingValue, !userRatingPerDetail[currentDetailForModal.id], userRatingPerDetail[currentDetailForModal.id] ? null : setRatingValue)}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Review (Optional)</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your thoughts about this product..."
                  className="w-full px-3 py-2 border border-gray-300 rounded resize-none"
                  rows="4"
                  disabled={userRatingPerDetail[currentDetailForModal.id] ? false : false}
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRatingModal(false);
                    setCurrentDetailForModal(null);
                    setCurrentRatingId(null);
                    setIsUpdate(false);
                    setRatingValue(5);
                    setReviewText('');
                  }}
                  className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ratingLoading}
                  className="flex-1 bg-orange-600 text-white py-2 rounded hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {ratingLoading ? 'Submitting...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowImageModal(false)}>
          <div className="relative max-w-4xl max-h-full p-4">
            <img
              src={currentImage}
              alt="Product full view"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-2 right-2 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CategoryDetails;