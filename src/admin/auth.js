// Admin session store.
//
// Holds the admin JWT (task 10) plus its expiry. All reads/writes go through
// this module so the storage mechanism and expiry policy live in one place.
//
// `getToken()` returns a ready-to-use `Authorization` header value
// ("Bearer <jwt>") so the shared admin API client can pass it straight through.
// A missing OR expired token is treated as no session: the stored values are
// cleared and callers see an unauthenticated state (redirect to login).

const TOKEN_KEY = 'sb_admin_token';
const EXPIRY_KEY = 'sb_admin_token_expiry';

/** Safe localStorage read that tolerates SSR / privacy modes. */
function readItem(key) {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Safe localStorage write/remove that tolerates SSR / privacy modes. */
function writeItem(key, value) {
  if (typeof window === 'undefined') return;
  try {
    if (value) {
      window.localStorage.setItem(key, value);
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Ignore storage failures; the session simply won't persist.
  }
}

/**
 * Whether the stored token has passed its expiry. A missing expiry is treated
 * as non-expiring (backward compatible with tokens stored without one).
 * @returns {boolean}
 */
function isExpired() {
  const expiry = readItem(EXPIRY_KEY);
  if (!expiry) return false;
  const expiresAt = Date.parse(expiry);
  // An unparseable expiry is treated as expired (fail closed).
  if (Number.isNaN(expiresAt)) return true;
  return Date.now() >= expiresAt;
}

/**
 * Persist a login session: the JWT and its expiry timestamp. Stores the token
 * as a full `Bearer <jwt>` header value so callers can use it verbatim.
 * @param {string} jwt              Raw JWT returned by /api/auth/login.
 * @param {string | Date} [expiresAtUtc]  Expiry (ISO string or Date).
 */
export function setSession(jwt, expiresAtUtc) {
  if (!jwt) {
    clearToken();
    return;
  }
  const expiry =
    expiresAtUtc instanceof Date ? expiresAtUtc.toISOString() : expiresAtUtc;
  writeItem(TOKEN_KEY, `Bearer ${jwt}`);
  writeItem(EXPIRY_KEY, expiry || '');
}

/**
 * Persist a raw `Authorization` header value directly (e.g. "Bearer <jwt>").
 * Clears any previously stored expiry. Prefer {@link setSession} when an expiry
 * is available. A falsy value clears the session.
 * @param {string} token
 */
export function setToken(token) {
  if (!token) {
    clearToken();
    return;
  }
  writeItem(TOKEN_KEY, token);
  writeItem(EXPIRY_KEY, '');
}

/**
 * Read the current `Authorization` header value, or null when no valid session
 * exists. An expired session is cleared and reported as absent.
 * @returns {string | null}
 */
export function getToken() {
  const token = readItem(TOKEN_KEY);
  if (!token) return null;
  if (isExpired()) {
    clearToken();
    return null;
  }
  return token;
}

/**
 * Remove the stored session (used on logout / 401 / expiry).
 */
export function clearToken() {
  writeItem(TOKEN_KEY, '');
  writeItem(EXPIRY_KEY, '');
}

/**
 * Whether a non-expired admin session is currently present.
 * @returns {boolean}
 */
export function isAuthenticated() {
  return Boolean(getToken());
}
