import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials } from '../../store/authSlice';
import { useLoginMutation } from '../../services/authService';
import { getApiErrorMessage } from '../../utils/apiError';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');

    try {
      const result = await login({ email, password }).unwrap();
      if (!result.accessToken) {
        setFormError(result.message || 'Login did not return an access token.');
        return;
      }
      if (result.Role?.toUpperCase() !== 'ADMIN') {
        setFormError('This account does not have admin access.');
        return;
      }
      dispatch(setCredentials({ accessToken: result.accessToken, role: result.Role }));
      navigate('/admin-dashboard', { replace: true });
    } catch (requestError: unknown) {
      setFormError(getApiErrorMessage(requestError, 'Could not log in.'));
    }
  }

  return (
    <section id="admin-login-page">
      <form className="form-container" onSubmit={handleSubmit}>
        <h2 className="form-title">Admin Portal</h2>
        <p className="form-subtitle">Sign in to manage users, inventory, and approvals.</p>

        <div className="form-group">
          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your admin email"
            autoComplete="email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="admin-password">Password</label>
          <div className="password-input-container">
            <input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter admin password"
              autoComplete="current-password"
              required
            />
            <button
              className="password-visibility-toggle"
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {formError && <p className="book-detail-error" role="alert">{formError}</p>}

        <div className="form-actions" style={{ justifyContent: 'center' }}>
          <button className="btn btn-success" type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in…' : 'Access Admin Dashboard'}
          </button>
        </div>

        <div className="form-note">
          Looking for the customer login? <Link to="/login">User Login</Link>
        </div>
      </form>
    </section>
  );
}

export default AdminLogin;
