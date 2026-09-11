import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Contact from './pages/Contact';
import RequireAuth from './admin/RequireAuth';
import AdminLayout from './admin/AdminLayout';
import AdminLogin from './admin/pages/Login';
import AdminDashboard from './admin/pages/Dashboard';
import LeadsDashboard from './admin/pages/LeadsDashboard';
import LeadDetail from './admin/pages/LeadDetail';
import ProjectsManager from './admin/pages/ProjectsManager';
import ProjectForm from './admin/pages/ProjectForm';
import TestimonialsManager from './admin/pages/TestimonialsManager';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public site: shares the Navbar/Footer chrome. */}
        <Route element={<PublicLayout />}>
          {/* Home ("/") shows every section on one combined, scrolling page. */}
          <Route index element={<LandingPage />} />
          {/* The individual pages still exist at their own URLs. */}
          <Route path="home" element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        {/* Admin area: rendered outside PublicLayout (no public chrome). */}
        {/* Login is public/unguarded so unauthenticated users can reach it. */}
        <Route path="/admin/login" element={<AdminLogin />} />
        {/* Everything else under /admin/* is behind the auth guard and shares
            the AdminLayout chrome (sidebar + header + logout). Nested routes
            render inside the layout's <Outlet/>. */}
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="leads" element={<LeadsDashboard />} />
          <Route path="leads/:id" element={<LeadDetail />} />
          <Route path="projects" element={<ProjectsManager />} />
          <Route path="projects/new" element={<ProjectForm />} />
          <Route path="projects/:id/edit" element={<ProjectForm />} />
          <Route path="testimonials" element={<TestimonialsManager />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
