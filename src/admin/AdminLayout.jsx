import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearToken } from './auth';

/**
 * Persistent chrome for the admin console.
 *
 * Renders a distinct admin shell (dark sidebar + header) that is intentionally
 * separate from the public Navbar/Footer. Nested admin routes render inside the
 * <Outlet/>. Navigation uses react-router NavLink so the active section is
 * highlighted.
 *
 * The Logout button clears the stored session token and returns to the login
 * screen, forcing re-authentication (Requirement 2.5).
 */

// `end` restricts the active state to an exact match so `/admin` isn't marked
// active while viewing `/admin/projects`, etc.
const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/leads', label: 'Leads', end: false },
  { to: '/admin/projects', label: 'Projects', end: false },
  { to: '/admin/testimonials', label: 'Testimonials', end: false },
];

function navLinkClass({ isActive }) {
  const base =
    'block rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-brass/40';
  return isActive
    ? `${base} bg-brass/20 text-brass`
    : `${base} text-champagne/80 hover:bg-white/5 hover:text-paper`;
}

export default function AdminLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    clearToken(); // Clear the session (Req 2.5).
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-paper text-ink lg:flex">
      {/* Sidebar navigation */}
      <aside className="bg-ink text-paper lg:flex lg:w-64 lg:flex-col lg:shrink-0">
        <div className="flex items-center gap-2 border-b border-white/10 px-6 py-5">
          <span className="font-display text-lg font-semibold text-paper">
            Swastik Buildcons
          </span>
        </div>
        <nav aria-label="Admin sections" className="px-4 py-5">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} className={navLinkClass}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-ink/10 bg-white px-6 py-4">
          <h1 className="font-display text-xl font-semibold text-ink">
            Swastik Buildcons Admin
          </h1>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-ink/15 bg-paper px-4 py-2 text-sm font-semibold text-coal shadow-crisp transition hover:bg-ivory focus:outline-none focus:ring-2 focus:ring-brass/40"
          >
            Log Out
          </button>
        </header>

        <main className="flex-1 px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
