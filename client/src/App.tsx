import './App.css';
import Home from './pages/Home';
import Header from './pages/Header';
import Footer from './pages/Footer';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import LendBook from './pages/LendBook';
import BookDetails from './pages/BookDetails';
import Profile from './pages/Profile+Setting/Profile';
import StoreDashboard from './pages/StoreDashboard';
import UserDashboard from './pages/UserDashboard';
import WishList from './pages/WishList';
import RentalHistory from './pages/RentalHistory';
import TransactionHistory from './pages/TransactionHistory';
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
