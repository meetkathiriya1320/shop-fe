import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';

const Admin = () => {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryDetails, setCategoryDetails] = useState([]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryPrice, setCategoryPrice] = useState('');
  const [categoryImages, setCategoryImages] = useState([]);
  const [categoryColor, setCategoryColor] = useState('');
  const [customColor, setCustomColor] = useState('');
  const [categoryMaterial, setCategoryMaterial] = useState('');
  const [categorySize, setCategorySize] = useState([]);
  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [imageIndices, setImageIndices] = useState({});
  const [callTime, setCallTime] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    if (currentSection === 'categories') {
      fetchCategories();
    }
  }, [currentSection]);

  const categoryOptions = [
    'Shirts',
    'T-shirts',
    'Jackets',
    'Jeans',
    'Track-pant',
    'Imported-tshirt',
    'Imported-shirt',
    'Formal-pant',
    'Hoody',
    'Full-sleeve-tshirt',
    'Polo-tshirt'
  ];

  const colorOptions = [
    'Red',
    'Blue',
    'Green',
    'Yellow',
    'Black',
    'White',
    'Gray',
    'Pink',
    'Purple',
    'Orange'
  ];

  const materialOptions = [
    'Cotton',
    'Polyester',
    'Wool',
    'Silk',
    'Linen',
    'Denim',
    'Leather',
    'Nylon',
    'Spandex',
    'Rayon'
  ];

  const sizeOptions = [
    'XS',
    'S',
    'M',
    'L',
    'XL',
    'XXL',
    '28',
    '30',
    '32',
    '34',
    '36'
  ];

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const formData = new FormData();
      const color = categoryColor === 'Other' ? customColor : categoryColor;
      formData.append('name', categoryName);
      formData.append('price', categoryPrice);
      categoryImages.forEach((file) => {
        formData.append('images', file);
      });
      formData.append('color', color);
      formData.append('material', categoryMaterial);
      formData.append('size', categorySize);

      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      if (response.ok) {
        setMessage('Category added successfully!');
        setCategoryName('');
        setCategoryPrice('');
        setCategoryImages([]);
        setCategoryColor('');
        setCustomColor('');
        setCategoryMaterial('');
        setCategorySize([]);
        setShowAddCategoryModal(false);
        // Refresh categories list after successful addition
        fetchCategories();
      } else {
        setMessage('Failed to add category.');
      }
    } catch (error) {
      setMessage('Error adding category.');
    }
  };

  const handleImageChange = (e) => {
     setCategoryImages(Array.from(e.target.files));
   };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const formData = new FormData();
      const color = categoryColor === 'Other' ? customColor : categoryColor;
      formData.append('name', categoryName);
      formData.append('price', categoryPrice);
      categoryImages.forEach((file) => {
        formData.append('images', file);
      });
      formData.append('color', color);
      formData.append('material', categoryMaterial);
      if (Array.isArray(categorySize)) {
        categorySize.forEach(size => formData.append('size', size));
      } else {
        if (Array.isArray(categorySize)) {
          categorySize.forEach(size => formData.append('size', size));
        } else {
          if (Array.isArray(categorySize)) {
            categorySize.forEach(size => formData.append('sizes', size));
          } else {
            formData.append('sizes', categorySize);
          }
        }
      }

      const response = await fetch(`/api/categories/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setMessage('Category updated successfully!');
        setCategoryName('');
        setCategoryPrice('');
        setCategoryImages([]);
        setCategoryColor('');
        setCustomColor('');
        setCategoryMaterial('');
        setCategorySize([]);
        setShowAddCategoryModal(false);
        setEditingItem(null);
        // Refresh the current category details
        handleCategoryClick(selectedCategory);
      } else {
        setMessage('Failed to update category.');
      }
    } catch (error) {
      setMessage('Error updating category.');
    }
  };

  const handleDeleteCategory = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(`/api/categories/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage('Category deleted successfully!');
        // Refresh the current category details
        handleCategoryClick(selectedCategory);
      } else {
        setMessage('Failed to delete category.');
      }
    } catch (error) {
      setMessage('Error deleting category.');
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const openDeleteModal = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const openImageModal = (images, itemName) => {
    setSelectedItem({ images, name: itemName });
    setModalImageIndex(0);
    setShowImageModal(true);
  };

  const nextModalImage = () => {
    if (selectedItem && selectedItem.images) {
      setModalImageIndex((prev) => (prev + 1) % selectedItem.images.length);
    }
  };

  const prevModalImage = () => {
    if (selectedItem && selectedItem.images) {
      setModalImageIndex((prev) => prev > 0 ? prev - 1 : selectedItem.images.length - 1);
    }
  };

  const nextImage = (itemId, images) => {
    setImageIndices(prev => ({
      ...prev,
      [itemId]: ((prev[itemId] || 0) + 1) % images.length
    }));
  };

  const prevImage = (itemId, images) => {
    setImageIndices(prev => ({
      ...prev,
      [itemId]: prev[itemId] > 0 ? prev[itemId] - 1 : images.length - 1
    }));
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setCategoryName(item.name || '');
    setCategoryPrice(item.price || '');
    const color = item.color || '';
    if (colorOptions.includes(color)) {
      setCategoryColor(color);
      setCustomColor('');
    } else {
      setCategoryColor('Other');
      setCustomColor(color);
    }
    setCategoryMaterial(item.material || '');
    setCategorySize(Array.isArray(item.size) ? item.size : item.size ? [item.size] : []);
    setCategoryImages([]);
    setShowAddCategoryModal(true);
  };

  const fetchCategories = async () => {
     setLoading(true);
     setError('');
     try {
       const response = await fetch('/api/categories/grouped', {
         headers: {
           'Authorization': `Bearer ${token}`,
         },
       });
       if (response.ok) {
         const data = await response.json();
         console.log('Categories API response:', data);
         setCategories(data);
       } else {
         setError('Failed to fetch categories.');
       }
     } catch (err) {
       setError('Error fetching categories.');
     } finally {
       setLoading(false);
     }
   };

  const handleCategoryClick = async (categoryName) => {
    setSelectedCategory(categoryName);
    setCurrentSection('category-details');
    setLoading(true);
    setError('');
    setCallTime(new Date());

    try {
      const response = await fetch('/api/categories/names', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: categoryName }),
      });

      if (response.ok) {
        const data = await response.json();
        const items = data.categories || (Array.isArray(data) ? data : [data]);
        setCategoryDetails(items);
      } else {
        setError('Failed to fetch category details.');
      }
    } catch (err) {
      setError('Error fetching category details.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex items-center p-4 bg-white border-b">
        <button
          onClick={() => window.history.back()}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>
      <Header />
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md min-h-screen">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
            <nav className="mt-6">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setCurrentSection('dashboard')}
                    className={`block w-full text-left px-4 py-2 rounded ${currentSection === 'dashboard' ? 'bg-gray-200' : 'text-gray-700 hover:bg-gray-200'}`}
                  >
                    Dashboard
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setCurrentSection('categories');
                      setSelectedCategory(null);
                      setCategoryDetails([]);
                    }}
                    className={`block w-full text-left px-4 py-2 rounded ${currentSection === 'categories' || currentSection === 'category-details' ? 'bg-gray-200' : 'text-gray-700 hover:bg-gray-200'}`}
                  >
                    Categories
                  </button>
                </li>
                {currentSection === 'category-details' && selectedCategory && (
                  <li>
                    <button
                      onClick={() => {
                        setCurrentSection('categories');
                        setSelectedCategory(null);
                        setCategoryDetails([]);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-200 rounded"
                    >
                      ← Back to Categories
                    </button>
                  </li>
                )}
                <li>
                  <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-200 rounded">
                    Users
                  </a>
                </li>
                <li>
                  <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-200 rounded">
                    Products
                  </a>
                </li>
                <li>
                  <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-200 rounded">
                    Orders
                  </a>
                </li>
                <li>
                  <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-200 rounded">
                    Settings
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {currentSection === 'dashboard' && (
            <>
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
                  <p className="text-2xl font-bold text-blue-600">1,234</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-700">Total Products</h3>
                  <p className="text-2xl font-bold text-green-600">567</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-700">Total Orders</h3>
                  <p className="text-2xl font-bold text-orange-600">890</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-700">Revenue</h3>
                  <p className="text-2xl font-bold text-purple-600">$12,345</p>
                </div>
              </div>
            </>
          )}

          {currentSection === 'categories' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
                <button
                  onClick={() => setShowAddCategoryModal(true)}
                  className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
                >
                  Add Category
                </button>
              </div>
              {loading && <p className="text-gray-600">Loading categories...</p>}
              {error && <p className="text-red-600">{error}</p>}
              {!loading && !error && categories && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Object.entries(categories).map(([categoryType, items]) => (
                    <div
                      key={categoryType}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                      onClick={() => handleCategoryClick(categoryType)}
                    >
                      {items.length > 0 && items[0].images && items[0].images.length > 0 && (
                        <img
                          src={`http://localhost:3001${items[0].images[0]}`}
                          alt={categoryType}
                          className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <div className="p-4">
                        <h3 className="text-xl font-bold text-gray-900 text-center break-words">{categoryType}</h3>
                        <p className="text-sm text-gray-600 text-center mt-2">{items.length} items</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {currentSection === 'category-details' && selectedCategory && (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">{selectedCategory} Details</h1>
                  {callTime && <p className="text-sm text-gray-600">Last updated: {callTime.toLocaleString()}</p>}
                </div>
                <button
                  onClick={() => setShowAddCategoryModal(true)}
                  className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
                >
                  Add Category
                </button>
              </div>

              {loading && <p className="text-gray-600">Loading category details...</p>}
              {error && <p className="text-red-600">{error}</p>}

              {!loading && !error && categoryDetails.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {categoryDetails.slice(0, 4).map((item, index) => {
                    const currentIndex = imageIndices[item.id] || 0;
                    const currentImage = item.images && item.images.length > 0 ? item.images[currentIndex] : null;
                    return (
                      <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-in fade-in duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                        {currentImage && (
                          <div className="relative">
                            <img
                              src={`http://localhost:3001${currentImage}`}
                              alt={item.name || `Item ${index + 1}`}
                              className="w-full h-48 object-contain cursor-pointer hover:opacity-90 transition-all duration-300"
                              onClick={() => openImageModal(item.images, item.name || `Item ${index + 1}`)}
                            />
                            {item.images && item.images.length > 1 && (
                              <>
                                <button
                                  onClick={() => prevImage(item.id, item.images)}
                                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 transition-colors"
                                >
                                  ‹
                                </button>
                                <button
                                  onClick={() => nextImage(item.id, item.images)}
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 transition-colors"
                                >
                                  ›
                                </button>
                              </>
                            )}
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-800 break-words">{item.name || `Item ${index + 1}`}</h3>
                          {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
                          <div className="mt-2 text-sm text-gray-600 space-y-1">
                            {item.price && <p><span className="font-medium">Price:</span> ₹{item.price}</p>}
                            {item.color && <p><span className="font-medium">Color:</span> {item.color}</p>}
                            {item.material && <p><span className="font-medium">Material:</span> {item.material}</p>}
                            {item.size && <p><span className="font-medium">Size:</span> {item.size}</p>}
                            {item.created_at && <p><span className="font-medium">Created:</span> {new Date(item.created_at).toLocaleDateString()}</p>}
                          </div>
                          <div className="mt-4 flex space-x-2">
                            <button
                              onClick={() => handleEditClick(item)}
                              className="flex-1 bg-blue-600 text-white text-sm py-1 px-2 rounded hover:bg-blue-700 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => openDeleteModal(item)}
                              className="flex-1 bg-red-600 text-white text-sm py-1 px-2 rounded hover:bg-red-700 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Add/Edit Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">{editingItem ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={editingItem ? handleUpdateCategory : handleAddCategory}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Category Name</label>
                <select
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  required
                >
                  <option value="">Select Category</option>
                  {categoryOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={categoryPrice}
                  onChange={(e) => setCategoryPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Color</label>
                <select
                  value={categoryColor}
                  onChange={(e) => setCategoryColor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
                >
                  <option value="">Select Color</option>
                  {colorOptions.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
                {categoryColor === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter custom color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    required
                  />
                )}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Material</label>
                <select
                  value={categoryMaterial}
                  onChange={(e) => setCategoryMaterial(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  required
                >
                  <option value="">Select Material</option>
                  {materialOptions.map(material => (
                    <option key={material} value={material}>{material}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Size</label>
                <div className="grid grid-cols-3 gap-2">
                  {sizeOptions.map(size => (
                    <label key={size} className="flex items-center">
                      <input
                        type="checkbox"
                        value={size}
                        checked={categorySize.includes(size)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCategorySize([...categorySize, size]);
                          } else {
                            setCategorySize(categorySize.filter(s => s !== size));
                          }
                        }}
                        className="mr-2"
                      />
                      {size}
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Select Photos</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 transition-colors"
              >
                {editingItem ? 'Update Category' : 'Add Category'}
              </button>
            </form>
            {message && (
              <div className={`mt-4 text-center ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </div>
            )}
            <button
              onClick={() => {
                setShowAddCategoryModal(false);
                setEditingItem(null);
                setCategoryName('');
                setCategoryPrice('');
                setCategoryImages([]);
                setCategoryColor('');
                setCategoryMaterial('');
                setCategorySize([]);
              }}
              className="mt-4 w-full text-gray-600 py-2 border border-gray-300 rounded hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && itemToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{itemToDelete.name}"? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setItemToDelete(null);
                }}
                className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCategory}
                className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && selectedItem && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-in fade-in duration-300" onClick={() => setShowImageModal(false)}>
          <div className="relative w-full h-full p-4 bg-white animate-in slide-in-from-bottom-4 duration-300">
            {selectedItem.images && selectedItem.images.length > 0 && (
              <div className="flex space-x-2 overflow-x-auto mb-4">
                {selectedItem.images.map((image, imgIndex) => (
                  <img
                    key={imgIndex}
                    src={`http://localhost:3001${image}`}
                    alt={`${selectedItem.name} - ${imgIndex + 1}`}
                    className="w-32 h-32 object-contain cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                ))}
              </div>
            )}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-2 right-2 text-gray-600 bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-300 transition-colors"
            >
              ×
            </button>
            <div className="text-gray-800">
              <h3 className="text-lg font-semibold mb-2">{selectedItem.name}</h3>
              {selectedItem.description && <p className="text-sm text-gray-600 mb-2">{selectedItem.description}</p>}
              <div className="text-sm text-gray-600 space-y-1">
                {selectedItem.price && <p><span className="font-medium">Price:</span> ₹{selectedItem.price}</p>}
                {selectedItem.color && <p><span className="font-medium">Color:</span> {selectedItem.color}</p>}
                {selectedItem.material && <p><span className="font-medium">Material:</span> {selectedItem.material}</p>}
                {selectedItem.size && <p><span className="font-medium">Size:</span> {selectedItem.size}</p>}
                {selectedItem.created_at && <p><span className="font-medium">Created:</span> {new Date(selectedItem.created_at).toLocaleDateString()}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;