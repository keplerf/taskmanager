import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services';
import './ResetPasswordPage.css';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="reset-password-page">
        <h2>Invalid Link</h2>
        <p className="reset-password-page__message">
          This password reset link is invalid or has expired.
        </p>
        <Link to="/forgot-password" className="reset-password-page__link">
          Request a new link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(token, password);
      navigate('/login', { state: { message: 'Password reset successfully. Please log in.' } });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      setError(error.response?.data?.error?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <h2>Reset Password</h2>
      <p className="reset-password-page__description">
        Enter your new password below.
      </p>

      {error && <div className="reset-password-page__error">{error}</div>}

      <form onSubmit={handleSubmit} className="reset-password-page__form">
        <div className="reset-password-page__field">
          <label htmlFor="password">New Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoFocus
          />
        </div>

        <div className="reset-password-page__field">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="reset-password-page__submit"
        >
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <Link to="/login" className="reset-password-page__link">
        Back to login
      </Link>
    </div>
  );
}
