import './styles/base.css';
import './styles/forms.css';
import './styles/data-display.css';
import { ReactNode, useEffect, useState } from 'react';
import Home from './pages/Home';
import Header from './components/Header';
import Footer from './components/Footer';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import LendBook from './pages/user/LendBook';
import BookDetails from './pages/books/BookDetails';
import Profile from './pages/user/Profile';
import StoreDashboard from './pages/store/StoreDashboard';
import UserDashboard from './pages/user/UserDashboard';
import WishList from './pages/user/WishList';
import RentalHistory from './pages/user/RentalHistory';
import TransactionHistory from './pages/user/TransactionHistory';
import ResetPassword from './pages/auth/ResetPassword';
import Cart from './pages/user/Cart';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';
import { useAppSelector } from './store/hooks';

function RequireAuth({ children }: { children: ReactNode }) {
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  return accessToken
    ? children
    : <Navigate to="/" replace state={{ authNotice: true }} />;
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const role = useAppSelector((state) => state.auth.role)?.toUpperCase();

  return accessToken && role === 'ADMIN'
    ? children
    : <Navigate to="/admin-login" replace state={{ authNotice: true }} />;
}

function RequireVolunteer({ children }: { children: ReactNode }) {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const role = useAppSelector((state) => state.auth.role)?.toUpperCase();

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return role === 'VOLUNTEER' ? children : <Navigate to="/" replace />;
}

function RequireStoreManager({ children }: { children: ReactNode }) {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const role = useAppSelector((state) => state.auth.role)?.toUpperCase();

  return accessToken && role === 'STORE_MANAGER'
    ? children
    : <Navigate to="/" replace />;
}

function AuthNotice() {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const hasAuthNotice = (location.state as { authNotice?: boolean } | null)?.authNotice;

  useEffect(() => {
    if (!hasAuthNotice) {
      return;
    }

    setIsVisible(true);
    navigate(`${location.pathname}${location.search}${location.hash}`, {
      replace: true,
      state: null,
    });
  }, [hasAuthNotice, location.hash, location.pathname, location.search, navigate]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const timeoutId = window.setTimeout(() => setIsVisible(false), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [isVisible]);

  return isVisible ? (
    <p className="auth-required-notice" role="status">
      Please log in to continue.
    </p>
  ) : null;
}

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, search]);

  return null;
}

function App() {
  return (
    <div className="App">
      <Router>
        <ScrollToTop />
        <AuthNotice />
        <Header />
        <main className='container'>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
            <Route path="/volunteer-dashboard" element={<RequireVolunteer><VolunteerDashboard /></RequireVolunteer>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/lend-book" element={<RequireAuth><LendBook /></RequireAuth>} />
            <Route path="/book/:id" element={<BookDetails />} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/store-dashboard" element={<RequireStoreManager><StoreDashboard /></RequireStoreManager>} />
            <Route path="/user-dashboard" element={<RequireAuth><UserDashboard /></RequireAuth>} />
            <Route path="/wishlist" element={<RequireAuth><WishList /></RequireAuth>} />
            <Route path="/cart" element={<RequireAuth><Cart /></RequireAuth>} />
            <Route path="/rental-history" element={<RequireAuth><RentalHistory /></RequireAuth>} />
            <Route path="/transaction-history" element={<RequireAuth><TransactionHistory /></RequireAuth>} />
          </Routes>
        </main>
      </Router>
      <Footer />
    </div>
  );
}

export default App;
