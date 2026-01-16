import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services';
import './ForgotPasswordPage.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      setError(error.response?.data?.error?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="forgot-password-page">
        <h2>Check your email</h2>
        <p className="forgot-password-page__message">
          If an account exists for <strong>{email}</strong>, you will receive a password reset link.
        </p>
        <Link to="/login" className="forgot-password-page__link">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      <h2>Forgot Password</h2>
      <p className="forgot-password-page__description">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      {error && <div className="forgot-password-page__error">{error}</div>}

      <form onSubmit={handleSubmit} className="forgot-password-page__form">
        <div className="forgot-password-page__field">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="forgot-password-page__submit"
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <Link to="/login" className="forgot-password-page__link">
        Back to login
      </Link>
    </div>
  );
}
