import axios from 'axios';

// API Configuration for Backend Connection
const API_BASE_URL = 'https://shop-d9kr.onrender.com';

// Create a configured axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// API Endpoints
export const endpoints = {
    // Authentication
    auth: {
        login: '/api/auth/login',
        register: '/api/auth/register',
        logout: '/api/auth/logout',
        profile: '/api/auth/profile',
        refresh: '/api/auth/refresh',
    },

    // Products
    products: {
        list: '/api/products',
        details: (id) => `/api/products/${id}`,
        categories: '/api/products/categories',
        search: '/api/products/search',
        featured: '/api/products/featured',
        byCategory: (category) => `/api/products/category/${category}`,
    },

    // Cart
    cart: {
        get: '/api/cart',
        add: '/api/cart/add',
        update: '/api/cart/update',
        remove: '/api/cart/remove',
        clear: '/api/cart/clear',
    },

    // Orders
    orders: {
        list: '/api/orders',
        create: '/api/orders',
        details: (id) => `/api/orders/${id}`,
        cancel: (id) => `/api/orders/${id}/cancel`,
        status: (id) => `/api/orders/${id}/status`,
    },

    // Favorites
    favorites: {
        get: '/api/favorites',
        add: '/api/favorites/add',
        remove: '/api/favorites/remove',
    },

    // Ratings & Reviews
    ratings: {
        get: (productId) => `/api/products/${productId}/ratings`,
        add: (productId) => `/api/products/${productId}/ratings`,
        update: (productId, ratingId) => `/api/products/${productId}/ratings/${ratingId}`,
        delete: (productId, ratingId) => `/api/products/${productId}/ratings/${ratingId}`,
    },

    // User
    user: {
        profile: '/api/user/profile',
        update: '/api/user/profile',
        address: '/api/user/address',
        paymentMethods: '/api/user/payment-methods',
    },

    // Admin (if needed)
    admin: {
        products: '/api/admin/products',
        orders: '/api/admin/orders',
        users: '/api/admin/users',
        analytics: '/api/admin/analytics',
    },
};

// API Helper Functions
export const apiHelpers = {
    // Generic request method
    request: async (method, url, data = null) => {
        try {
            const config = { method, url };
            if (data) {
                config.data = data;
            }
            const response = await api(config);
            return response.data;
        } catch (error) {
            console.error(`API ${method.toUpperCase()} ${url} failed:`, error);
            throw error;
        }
    },

    // GET request
    get: (url) => apiHelpers.request('get', url),

    // POST request
    post: (url, data) => apiHelpers.request('post', url, data),

    // PUT request
    put: (url, data) => apiHelpers.request('put', url, data),

    // PATCH request
    patch: (url, data) => apiHelpers.request('patch', url, data),

    // DELETE request
    delete: (url) => apiHelpers.request('delete', url),
};

// Export configured axios instance and helpers
export { api };
export default api;