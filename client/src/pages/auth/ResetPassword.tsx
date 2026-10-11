import { FormEvent, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useResetPasswordMutation } from '../../services/authService';
import { getApiErrorMessage } from '../../utils/apiError';

function ResetPassword() {
  const { token = '' } = useParams<{ token: string }>();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    try {
      const result = await resetPassword({
        token,
        newPassword,
        confirmPassword,
      }).unwrap();
      navigate('/login', { replace: true, state: { registrationMessage: result.message } });
    } catch (requestError: unknown) {
      setFormError(getApiErrorMessage(requestError, 'Could not reset your password.'));
    }
  }

  return (
    <section id="forgot-password-page">
      <form className="form-container" onSubmit={handleSubmit}>
        <h2 className="form-title">Choose a New Password</h2>
        <div className="form-group">
          <label htmlFor="new-password">New Password</label>
          <div className="password-input-container">
            <input
              id="new-password"
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <button
              className="password-visibility-toggle"
              type="button"
              onClick={() => setShowNewPassword((visible) => !visible)}
              aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showNewPassword}
            >
              {showNewPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="confirm-new-password">Confirm Password</label>
          <div className="password-input-container">
            <input
              id="confirm-new-password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
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
        <div className="form-actions" style={{ justifyContent: 'center' }}>
          <button className="btn btn-success" type="submit" disabled={isLoading}>
            {isLoading ? 'Resetting…' : 'Reset Password'}
          </button>
        </div>
        <div className="form-note"><Link to="/login">Back to login</Link></div>
      </form>
    </section>
  );
}

export default ResetPassword;
