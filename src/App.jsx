import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { RatingsProvider } from './contexts/RatingsContext';
import ProtectedRoute from './components/ProtectedRoute';
import MenCollection from './pages/MenCollection';
import Admin from './pages/Admin';
import CategoryDetails from './pages/CategoryDetails';
import Cart from './pages/Cart';
import Favorites from './pages/Favorites';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import OrderHistory from './pages/OrderHistory';
import OrderDetails from './pages/OrderDetails';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <RatingsProvider>
            <Router>
              <Routes>
                <Route path="/" element={<MenCollection />} />
                <Route path="/category-details" element={<CategoryDetails />} />
                <Route path="/category-details/:productId" element={<CategoryDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/orders" element={<OrderHistory />} />
                <Route path="/order/:orderId" element={<OrderDetails />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/admin" element={
                  <ProtectedRoute adminOnly={true}>
                    <Admin />
                  </ProtectedRoute>
                } />
              </Routes>
            </Router>
          </RatingsProvider>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;