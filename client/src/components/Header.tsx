import './Header.css';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearCredentials } from '../store/authSlice';
import { useLogoutMutation } from '../services/authService';
import { getApiErrorMessage } from '../utils/apiError';
import { graphqlApi } from '../services/graphqlApi';
import { useGetUserProfileQuery } from '../services/profileService';
import { useGetCartQuery } from '../services/cartService';

function Header() {
  const [searchTerm, setSearchTerm] = useState('');
  const [logoutError, setLogoutError] = useState('');
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const role = useAppSelector((state) => state.auth.role);
  const normalizedRole = role?.toUpperCase();
  const isAdmin = normalizedRole === 'ADMIN';
  const dashboard = normalizedRole === 'STORE_MANAGER'
    ? { path: '/store-dashboard', label: 'Store Dashboard' }
    : { path: '/user-dashboard', label: 'Dashboard' };
  const { data: profile } = useGetUserProfileQuery(undefined, {
    skip: !accessToken || isAdmin,
  });
  const { data: cartItems = [] } = useGetCartQuery(undefined, {
    skip: !accessToken || isAdmin,
  });
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = searchTerm.trim();
    navigate(term ? `/?search=${encodeURIComponent(term)}` : '/');
  }

  async function handleLogout() {
    setLogoutError('');
    try {
      await logout().unwrap();
      dispatch(clearCredentials());
      dispatch(graphqlApi.util.resetApiState());
      navigate('/');
    } catch (requestError: unknown) {
      dispatch(clearCredentials());
      dispatch(graphqlApi.util.resetApiState());
      navigate('/');
      setLogoutError(getApiErrorMessage(
        requestError,
        'Your local session ended, but the backend logout failed.',
      ));
    }
  }

  return (
    <header className="header">
      <div className="container header-container">
        <Link className="logo" to="/">Rent<span>&amp;</span>Reads</Link>
        {!isAdmin && (
          <form className="search-bar" onSubmit={handleSearch} role="search">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search books by title, author..."
              aria-label="Search books"
            />
            <button type="submit" aria-label="Search">🔍</button>
          </form>
        )}
        <nav className="auth-buttons" aria-label="Account navigation">
          {accessToken ? (
            <>
              {isAdmin ? (
                <>
                  <Link className="btn" to="/admin-dashboard">
                    Admin Dashboard
                  </Link>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => void handleLogout()}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? 'Logging out…' : 'Log out'}
                  </button>
                </>
              ) : (
                <>
                  <Link className="wishlist-header-link" to="/wishlist" aria-label="Wishlist" title="Wishlist">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      width="22"
                      height="22"
                      fill="currentColor"
                    >
                      <path d="M12 21.35 10.55 20C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A6 6 0 0 1 16.5 3C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.51L12 21.35Z" />
                    </svg>
                  </Link>
                  <Link className="btn" to="/cart">
                    Cart ({cartItems.reduce((count, item) => count + item.quantity, 0)})
                  </Link>
                  <details
                    className="profile-menu"
                    onMouseLeave={(event) => {
                      event.currentTarget.open = false;
                    }}
                  >
                    <summary
                      className="profile-avatar-link"
                      aria-label="Open profile menu"
                      title="Profile menu"
                    >
                      {profile?.profile_image ? (
                        <img
                          className="profile-avatar-image"
                          src={profile.profile_image}
                          alt=""
                        />
                      ) : (
                        <span aria-hidden="true">
                          {profile?.fullName
                            .split(/\s+/)
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((part) => part[0].toUpperCase())
                            .join('') || 'Me'}
                        </span>
                      )}
                    </summary>
                    <nav className="profile-menu-items" aria-label="Profile navigation">
                      <Link to="/profile" onClick={(event) => event.currentTarget.closest('details')?.removeAttribute('open')}>
                        Profile
                      </Link>
                      <Link to={dashboard.path} onClick={(event) => event.currentTarget.closest('details')?.removeAttribute('open')}>
                        {dashboard.label}
                      </Link>
                      {normalizedRole === 'VOLUNTEER' && (
                        <Link to="/volunteer-dashboard" onClick={(event) => event.currentTarget.closest('details')?.removeAttribute('open')}>
                          Volunteer Journeys
                        </Link>
                      )}
                      <Link to="/lend-book" onClick={(event) => event.currentTarget.closest('details')?.removeAttribute('open')}>
                        Lend a Book
                      </Link>
                      <button
                        className="profile-menu-logout"
                        type="button"
                        onClick={() => void handleLogout()}
                        disabled={isLoggingOut}
                      >
                        {isLoggingOut ? 'Logging out…' : 'Log out'}
                      </button>
                    </nav>
                  </details>
                </>
              )}
            </>
          ) : (
            <>
              <Link className="btn" to="/login">Login</Link>
              <Link className="btn btn-secondary" to="/register">Register</Link>
              <Link className="btn btn-warning" to="/admin-login">Admin Login</Link>
            </>
          )}
        </nav>
      </div>
      {logoutError && <p className="book-detail-error" role="alert">{logoutError}</p>}
    </header>
  );
}

export default Header;
