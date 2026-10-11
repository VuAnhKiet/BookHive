import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSendPasswordResetEmailMutation } from '../../services/authService';
import { getApiErrorMessage } from '../../utils/apiError';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [sendResetEmail, { isLoading }] = useSendPasswordResetEmailMutation();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setFormError('');
    try {
      const result = await sendResetEmail(email).unwrap();
      setMessage(result.message);
    } catch (requestError: unknown) {
      setFormError(getApiErrorMessage(requestError, 'Could not send a reset email.'));
    }
  }

  return (
    <section id="forgot-password-page">
      <form className="form-container" onSubmit={handleSubmit}>
        <h2 className="form-title">Reset Your Password</h2>
        <div className="form-group">
          <label htmlFor="reset-email">Email Address</label>
          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            autoComplete="email"
            required
          />
        </div>
        {formError && <p className="book-detail-error" role="alert">{formError}</p>}
        {message && <p role="status">{message}</p>}
        <div className="form-actions" style={{ justifyContent: 'center' }}>
          <button className="btn btn-success" type="submit" disabled={isLoading}>
            {isLoading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </div>
        <div className="form-note">
          Remember your password? <Link to="/login">Login</Link>
        </div>
      </form>
    </section>
  );
}

export default ForgotPassword;
