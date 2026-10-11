import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials } from '../../store/authSlice';
import { useLoginMutation } from '../../services/authService';
import { getApiErrorMessage } from '../../utils/apiError';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const registrationMessage = (location.state as { registrationMessage?: string } | null)
    ?.registrationMessage;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    try {
      const result = await login({ email, password }).unwrap();
      if (!result.accessToken) {
        setFormError(result.message || 'Login did not return an access token.');
        return;
      }
      dispatch(setCredentials({ accessToken: result.accessToken, role: result.Role ?? null }));
      const normalizedRole = result.Role?.toUpperCase();
      const destination = normalizedRole === 'ADMIN'
        ? '/admin-dashboard'
        : normalizedRole === 'STORE_MANAGER'
          ? '/store-dashboard'
          : '/';
      navigate(destination, { replace: true });
    } catch (requestError: unknown) {
      setFormError(getApiErrorMessage(requestError, 'Could not log in.'));
    }
  }

  return (
    <section id="login-page">
      <form className="form-container" onSubmit={handleSubmit}>
        <h2 className="form-title">Login</h2>
        {registrationMessage && <p role="status">{registrationMessage}</p>}
        <div className="form-group">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            autoComplete="email"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="login-password">Password</label>
          <div className="password-input-container">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
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
        <div style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '20px' }}>
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
        {formError && <p className="book-detail-error" role="alert">{formError}</p>}
        <div className="form-actions" style={{ justifyContent: 'center' }}>
          <button className="btn btn-success" type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in…' : 'Login'}
          </button>
        </div>
        <div className="form-note">
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </div>
      </form>
    </section>
  );
}

export default Login;
