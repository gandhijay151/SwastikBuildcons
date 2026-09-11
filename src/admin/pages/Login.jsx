import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getApiBaseUrl } from '../../lib/api';
import { isAuthenticated, setSession } from '../auth';

/**
 * Admin login screen.
 *
 * Authenticates against the JWT login endpoint (POST /api/auth/login, task 10).
 * On success the returned JWT and its expiry are stored via {@link setSession};
 * the shared admin API client then attaches the token as an
 * `Authorization: Bearer <jwt>` header. On failure no session is stored and an
 * inline error is shown (Requirements 2.2, 2.3, 2.4, 9.1).
 */
export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already signed in: skip the form (Req 2.4).
  if (isAuthenticated()) {
    return <Navigate to="/admin" replace />;
  }

  const redirectTo = location.state?.from?.pathname || '/admin';

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    setError('');
    setSubmitting(true);

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // Store the JWT + expiry; the API client attaches it as a Bearer
        // header and treats an expired token as unauthenticated (Req 2.2, 9.1).
        setSession(data.token, data.expiresAtUtc);
        navigate(redirectTo, { replace: true });
        return;
      }

      if (response.status === 401 || response.status === 403) {
        // Invalid credentials — deny access, store nothing (Req 2.3).
        setError('Invalid username or password');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch {
      // Network / server unreachable.
      setError('Unable to reach the server. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper bg-ivory-blueprint bg-[length:28px_28px] px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white shadow-soft border border-ink/5 p-8 sm:p-10">
          <div className="text-center mb-8">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-brass">
              Swastik Buildcons
            </span>
            <h1 className="mt-3 font-display text-2xl font-semibold text-ink">
              Admin Sign In
            </h1>
            <p className="mt-2 text-sm text-slate">
              Enter your credentials to access the management console.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-coal mb-1.5"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={submitting}
                aria-invalid={error ? 'true' : undefined}
                className="w-full rounded-lg border border-mist bg-paper/40 px-4 py-2.5 text-ink placeholder:text-slate/50 focus:border-brass focus:bg-white focus:outline-none focus:ring-2 focus:ring-brass/30 disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-coal mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                aria-invalid={error ? 'true' : undefined}
                className="w-full rounded-lg border border-mist bg-paper/40 px-4 py-2.5 text-ink placeholder:text-slate/50 focus:border-brass focus:bg-white focus:outline-none focus:ring-2 focus:ring-brass/30 disabled:opacity-60"
              />
            </div>

            {error && (
              <p
                role="alert"
                aria-live="assertive"
                className="rounded-lg bg-burgundy/10 border border-burgundy/20 px-4 py-2.5 text-sm text-burgundy"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-paper shadow-crisp transition hover:bg-coal focus:outline-none focus:ring-2 focus:ring-brass/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
