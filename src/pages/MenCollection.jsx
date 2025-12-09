import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

const MenCollection = () => {
  const { token } = useAuth();
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/categories/grouped', {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });
      if (response.ok) {
        const data = await response.json();
        const allProducts = Object.entries(data).flatMap(([cat, items]) =>
          items.slice(0, 1).map(item => ({ ...item, categoryName: cat, category: cat.toLowerCase().replace(' ', '-'), image: `http://localhost:3001${item.images[0]}` }))
        );
        setProducts(allProducts);
        setCategories(['all', ...Object.keys(data).map(cat => cat.toLowerCase().replace(' ', '-'))]);
      } else {
        setError('Failed to fetch categories.');
      }
    } catch (err) {
      setError('Error fetching categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [token]);

  const filteredProducts = products.filter(product =>
    selectedCategory === 'all' || product.category === selectedCategory
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return 0; // newest or popular, assuming order is fine
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:w-1/4 ${isFiltersOpen ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Filters</h3>
              <div className="mb-6">
                <h4 className="font-medium mb-2">Categories</h4>
                {categories.map(category => (
                  <label key={category} className="block mb-2">
                    <input
                      type="radio"
                      name="category"
                      value={category}
                      checked={selectedCategory === category}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="mr-2"
                    />
                    {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                  </label>
                ))}
              </div>
              <div>
                <h4 className="font-medium mb-2">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="newest">Newest</option>
                  <option value="popular">Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Men's Collection</h2>
              <button
                className="lg:hidden bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              >
                Filters
              </button>
            </div>
            {loading && <p className="text-gray-600">Loading products...</p>}
            {error && <p className="text-red-600">{error}</p>}
            {!loading && !error && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sortedProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MenCollection;