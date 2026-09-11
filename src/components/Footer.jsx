import { Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { company, services } from '../data/site';
import visitingLogo from '../../assets/brand/SWASTIK.svg';

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Projects', to: '/projects' },
  { label: 'Contact', to: '/contact' },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="container-shell grid gap-10 border-b border-white/8 py-14 md:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_0.8fr_1fr]">
        {/* Brand */}
        <div>
          <img src={visitingLogo} alt={company.name} className="h-10 w-auto brightness-0 invert" loading="lazy" decoding="async" />
          <p className="mt-5 max-w-xs text-sm leading-7 text-white/55">
            {company.intro}
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-brass">Quick Links</h3>
          <nav className="mt-5 grid gap-2.5">
            {quickLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="text-sm text-white/55 transition hover:text-brass"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-brass">Services</h3>
          <nav className="mt-5 grid gap-2.5">
            {services.slice(0, 5).map((service) => (
              <Link
                key={service.title}
                to="/services"
                className="text-sm text-white/55 transition hover:text-brass"
              >
                {service.title}
              </Link>
            ))}
          </nav>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-brass">Contact</h3>
          <div className="mt-5 grid gap-3">
            <a href={company.phoneHref} className="flex items-center gap-3 text-sm text-white/55 transition hover:text-brass">
              <Phone size={15} className="shrink-0" /> {company.phone}
            </a>
            <a href={company.emailHref} className="flex items-center gap-3 text-sm text-white/55 transition hover:text-brass">
              <Mail size={15} className="shrink-0" /> {company.email}
            </a>
            <span className="flex items-center gap-3 text-sm text-white/55">
              <MapPin size={15} className="shrink-0" /> {company.serviceArea}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="container-shell flex flex-col gap-2 py-5 text-xs text-white/40 md:flex-row md:items-center md:justify-between">
        <p>&copy; {new Date().getFullYear()} {company.name}. All rights reserved.</p>
        <p>{company.website}</p>
      </div>
    </footer>
  );
}
