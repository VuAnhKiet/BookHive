import './App.css';
import Home from './pages/Home';
import Header from './components/Header';
import Footer from './components/Footer';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
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
function App() {
  return (
    <div className="App">
      <Router>
        <Header />
        <main className='container'>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/lend-book" element={<LendBook />} />
            <Route path="/book/:id" element={<BookDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/store-dashboard" element={<StoreDashboard />} />
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/wishlist" element={<WishList />} />
            <Route path="/rental-history" element={<RentalHistory />} />
            <Route path="/transaction-history" element={<TransactionHistory />} />
          </Routes>
        </main>
      </Router>
      <Footer />
    </div>
  );
}

export default App;
