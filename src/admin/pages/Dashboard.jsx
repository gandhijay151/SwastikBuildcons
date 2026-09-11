/**
 * Placeholder admin dashboard index.
 *
 * Rendered as the index route inside AdminLayout, so it no longer owns any
 * page chrome (header/sidebar come from the layout). The full leads dashboard
 * is task 4.
 */
export default function Dashboard() {
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-ink">Dashboard</h2>
      <p className="mt-2 text-sm text-slate">
        Welcome to the management console. Use the navigation to manage leads,
        projects, and testimonials.
      </p>
    </div>
  );
}
