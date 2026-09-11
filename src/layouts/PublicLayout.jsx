import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';

/**
 * Shared chrome for all public routes. Navbar, Footer, and the WhatsApp button
 * persist across route changes while the matched route renders inside <Outlet/>.
 */
export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
