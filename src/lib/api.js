// Single source of truth for resolving the backend API base URL.
//
// Resolution order:
// 1. Explicitly configured API origin (set VITE_API_BASE_URL for production builds).
// 2. SSR / non-browser fallback for local development.
// 3. Local dev: talk to the backend on its default HTTP dev port (5027).
// 4. Deployed without VITE_API_BASE_URL: assume the API is served from the same
//    origin (reverse-proxied) and match the page protocol to avoid mixed-content
//    errors on HTTPS sites.
export function getApiBaseUrl() {
  // Preferred: explicitly configured API origin (set this for production builds).
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // SSR / non-browser fallback for local development.
  if (typeof window === 'undefined') return 'http://localhost:5027';

  const hostname = window.location.hostname || 'localhost';
  const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';

  // Local dev: talk to the backend on its default HTTP dev port.
  if (isLocalHost) {
    return `http://${hostname}:5027`;
  }

  // Deployed without VITE_API_BASE_URL: assume the API is served from the same
  // origin (reverse-proxied) and match the page protocol to avoid mixed-content
  // errors on HTTPS sites. Set VITE_API_BASE_URL to override.
  return window.location.origin;
}
