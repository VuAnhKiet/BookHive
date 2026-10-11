import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../../services/authService';
import { getApiErrorMessage } from '../../utils/apiError';

function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [register, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setSuccessMessage('');
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    try {
      const result = await register({
        fullName,
        email,
        password,
        confirmPassword,
      }).unwrap();
      setSuccessMessage(result.message);
      navigate('/login', { state: { registrationMessage: result.message } });
    } catch (requestError: unknown) {
      setFormError(getApiErrorMessage(requestError, 'Could not create your account.'));
    }
  }

  return (
    <section id="register-page">
      <form className="form-container" onSubmit={handleSubmit}>
        <h2 className="form-title">Create Account</h2>
        <div className="form-group">
          <label htmlFor="register-name">Full Name</label>
          <input
            id="register-name"
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Enter your full name"
            autoComplete="name"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            autoComplete="email"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="register-password">Password</label>
          <div className="password-input-container">
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
              autoComplete="new-password"
              minLength={6}
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
        <div className="form-group">
          <label htmlFor="confirm-password">Confirm Password</label>
          <div className="password-input-container">
            <input
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm your password"
              autoComplete="new-password"
              required
            />
            <button
              className="password-visibility-toggle"
              type="button"
              onClick={() => setShowConfirmPassword((visible) => !visible)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showConfirmPassword}
            >
              {showConfirmPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        {formError && <p className="book-detail-error" role="alert">{formError}</p>}
        {successMessage && <p role="status">{successMessage}</p>}
        <div className="form-actions" style={{ justifyContent: 'center' }}>
          <button className="btn btn-success" type="submit" disabled={isLoading}>
            {isLoading ? 'Creating account…' : 'Create Account'}
          </button>
        </div>
        <div className="form-note">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </form>
    </section>
  );
}

export default Register;
