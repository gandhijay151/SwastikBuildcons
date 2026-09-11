import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from './auth';

/**
 * Route guard for the admin area.
 *
 * Renders its children only when an admin session token is present. Otherwise
 * it redirects to `/admin/login`, preserving the intended location in
 * navigation state so the login flow (task 3.2) can return the admin there.
 *
 * @param {{ children: React.ReactNode }} props
 */
export default function RequireAuth({ children }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return children;
}
