// Shared admin API client.
//
// A thin, framework-agnostic wrapper around `fetch` for calls to the protected
// admin API. It centralizes three concerns so individual admin screens don't
// have to repeat them (design "Frontend › Admin app" + Error Handling):
//
//   1. Base URL resolution   — prefixes paths with getApiBaseUrl().
//   2. Authentication (Req 2.6) — attaches the stored `Authorization` header on
//      every request. getToken() returns the *full* header value
//      ("Bearer <jwt>", task 10) or null when the session is missing/expired,
//      so it is passed straight through.
//   3. 401 handling (Req 2.4) — a 401 clears the session and redirects the
//      browser to /admin/login, then throws so the caller stops processing.
//
// This module lives outside React Router, so the redirect uses
// window.location.assign — the simplest reliable option from plain JS.

import { getApiBaseUrl } from '../lib/api';
import { clearToken, getToken } from './auth';

/** Where unauthenticated users are sent when a request returns 401. */
export const LOGIN_PATH = '/admin/login';

/**
 * Error thrown for any non-2xx response. Carries the HTTP status and, when the
 * server returned a JSON body (e.g. ProblemDetails), the parsed payload so the
 * UI can surface a specific message.
 */
export class ApiError extends Error {
  /**
   * @param {string} message  Human-readable message (best-effort from the body).
   * @param {number} status   HTTP status code.
   * @param {unknown} [body]  Parsed response body when available.
   */
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

/** True when the request body should be JSON-encoded and content-typed. */
function isJsonBody(body) {
  if (body == null) return false;
  // Leave the caller's own encoding alone for these types.
  if (typeof body === 'string') return false;
  if (typeof FormData !== 'undefined' && body instanceof FormData) return false;
  if (typeof Blob !== 'undefined' && body instanceof Blob) return false;
  if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) return false;
  if (typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer) return false;
  return true;
}

/** Build an absolute URL from a leading-slash path (or pass through absolute URLs). */
function resolveUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;
  const base = getApiBaseUrl().replace(/\/$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}

/** Clear the session and send the browser to the login screen. */
function redirectToLogin() {
  clearToken();
  if (typeof window !== 'undefined') {
    window.location.assign(LOGIN_PATH);
  }
}

/** Best-effort parse of an error body into a user-facing message. */
function messageFromBody(body, status) {
  if (body && typeof body === 'object') {
    // ASP.NET Core ProblemDetails / ValidationProblemDetails shapes.
    if (typeof body.detail === 'string' && body.detail) return body.detail;
    if (typeof body.title === 'string' && body.title) return body.title;
    if (typeof body.message === 'string' && body.message) return body.message;
    if (body.errors && typeof body.errors === 'object') {
      const first = Object.values(body.errors).flat().find(Boolean);
      if (typeof first === 'string') return first;
    }
  }
  if (typeof body === 'string' && body.trim()) return body.trim();
  return `Request failed with status ${status}`;
}

/** Whether a response carries a JSON content type. */
function hasJsonContentType(response) {
  const type = response.headers.get('content-type') || '';
  return type.includes('application/json') || type.includes('+json');
}

/**
 * Core request runner. Returns the raw {@link Response} untouched (aside from
 * 401 handling) so callers that need blobs/streams (e.g. CSV export, task 4.4)
 * can consume it directly. Most callers should use {@link adminFetch} instead.
 *
 * @param {string} path              Leading-slash path (e.g. "/api/admin/leads") or absolute URL.
 * @param {RequestInit & { body?: unknown }} [options]  Standard fetch options; object `body` is JSON-encoded.
 * @returns {Promise<Response>}
 * @throws {ApiError} on 401 (after redirecting) so the caller stops processing.
 */
export async function adminRequest(path, options = {}) {
  const { headers: callerHeaders, body, ...rest } = options;

  const headers = new Headers(callerHeaders || {});

  // Attach the stored Bearer token verbatim; null when missing/expired (Req 2.6).
  const token = getToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', token);
  }

  // JSON-encode plain object bodies and set the content type when absent.
  let outgoingBody = body;
  if (isJsonBody(body)) {
    outgoingBody = JSON.stringify(body);
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  const response = await fetch(resolveUrl(path), {
    ...rest,
    headers,
    ...(body === undefined ? {} : { body: outgoingBody }),
  });

  // 401 → session is invalid/expired: clear it, redirect, and stop the caller (Req 2.4).
  if (response.status === 401) {
    redirectToLogin();
    throw new ApiError('Session expired. Redirecting to login.', 401);
  }

  return response;
}

/**
 * Perform an admin API call and return the parsed result.
 *
 * - 2xx with a JSON content type → parsed JSON.
 * - 204 No Content (or an empty body) → null.
 * - 2xx without JSON → the raw {@link Response} (caller decides how to read it).
 * - 401 → clears session, redirects to /admin/login, and throws (Req 2.4).
 * - other non-2xx → throws {@link ApiError} with status and parsed body.
 *
 * @template T
 * @param {string} path              Leading-slash path or absolute URL.
 * @param {RequestInit & { body?: unknown }} [options]  Fetch options; object `body` is JSON-encoded.
 * @returns {Promise<T | null | Response>}
 */
export async function adminFetch(path, options = {}) {
  const response = await adminRequest(path, options);

  if (!response.ok) {
    let errorBody;
    try {
      errorBody = hasJsonContentType(response)
        ? await response.json()
        : await response.text();
    } catch {
      errorBody = undefined;
    }
    throw new ApiError(messageFromBody(errorBody, response.status), response.status, errorBody);
  }

  // 204 No Content — nothing to parse.
  if (response.status === 204) return null;

  if (hasJsonContentType(response)) {
    // Guard against a 200 with an empty body.
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  // Non-JSON success (e.g. CSV): hand back the raw response for the caller.
  return response;
}

/** GET helper. @template T @returns {Promise<T | null | Response>} */
export function get(path, options = {}) {
  return adminFetch(path, { ...options, method: 'GET' });
}

/** POST helper (object `body` is JSON-encoded). @template T @returns {Promise<T | null | Response>} */
export function post(path, body, options = {}) {
  return adminFetch(path, { ...options, method: 'POST', body });
}

/** PUT helper (object `body` is JSON-encoded). @template T @returns {Promise<T | null | Response>} */
export function put(path, body, options = {}) {
  return adminFetch(path, { ...options, method: 'PUT', body });
}

/** PATCH helper (object `body` is JSON-encoded). @template T @returns {Promise<T | null | Response>} */
export function patch(path, body, options = {}) {
  return adminFetch(path, { ...options, method: 'PATCH', body });
}

/** DELETE helper. @template T @returns {Promise<T | null | Response>} */
export function del(path, options = {}) {
  return adminFetch(path, { ...options, method: 'DELETE' });
}

/**
 * Fetch a resource and return the raw {@link Response} on success, applying the
 * same auth + 401 handling. Intended for binary/text downloads such as the CSV
 * export (task 4.4) where the caller needs `response.blob()` / `response.text()`.
 *
 * @param {string} path
 * @param {RequestInit & { body?: unknown }} [options]
 * @returns {Promise<Response>}
 * @throws {ApiError} on non-2xx (401 also redirects to login).
 */
export async function adminFetchRaw(path, options = {}) {
  const response = await adminRequest(path, options);
  if (!response.ok) {
    let errorBody;
    try {
      errorBody = hasJsonContentType(response)
        ? await response.json()
        : await response.text();
    } catch {
      errorBody = undefined;
    }
    throw new ApiError(messageFromBody(errorBody, response.status), response.status, errorBody);
  }
  return response;
}
