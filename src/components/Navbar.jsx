import { Menu, Phone, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { company, navItems } from '../data/site';
import Button from './Button';
import visitingLogo from '../../assets/brand/SWASTIK.svg';

// Map the section ids used in navItems to their dedicated routes.
const routeForNavId = {
  home: '/',
  about: '/about',
  services: '/services',
  projects: '/projects',
  contact: '/contact',
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-ink/95 shadow-lg shadow-ink/10 backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <div className="container-shell flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="group flex items-center" onClick={() => setOpen(false)}>
          <img src={visitingLogo} alt={company.name} className="h-10 w-auto brightness-0 invert" loading="lazy" decoding="async" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={routeForNavId[item.id] ?? '/'}
              end={routeForNavId[item.id] === '/'}
              className={({ isActive }) =>
                `text-[13px] font-semibold uppercase tracking-wide transition-all duration-500 float-on-hover hover:text-brass hover:shadow-sm button-shine ${
                  isActive ? 'text-brass' : 'text-white/70'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-4 lg:flex">
          <a
            className="flex items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-brass"
            href={company.phoneHref}
          >
            <Phone size={14} />
            {company.phone}
          </a>
          <Button to="/contact" type="primary" onClick={() => setOpen(false)}>
            Free Quote
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          aria-label="Toggle menu"
          className="grid h-10 w-10 place-items-center rounded-md border border-white/15 text-white float-on-hover lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} className="transition-transform duration-500 group-hover:scale-110" /> : <Menu size={20} className="transition-transform duration-500 group-hover:scale-110" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-white/10 bg-ink/98 backdrop-blur-md shadow-2xl lg:hidden">
          <nav className="container-shell flex flex-col gap-1 py-4">
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={routeForNavId[item.id] ?? '/'}
                end={routeForNavId[item.id] === '/'}
                className={({ isActive }) =>
                  `rounded-md px-4 py-3 text-sm font-semibold transition-all duration-300 hover:bg-white/5 hover:text-brass ${
                    isActive ? 'bg-white/5 text-brass' : 'text-white/80'
                  }`
                }
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <div className="mt-3 flex flex-col gap-3 border-t border-white/10 pt-3">
              <a
                className="flex items-center justify-center gap-2 rounded-md border border-white/20 py-3 text-sm font-semibold text-white/90 transition hover:border-brass hover:text-brass"
                href={company.phoneHref}
                onClick={() => setOpen(false)}
              >
                <Phone size={16} />
                Call {company.phone}
              </a>
              <Button to="/contact" type="primary" className="w-full" onClick={() => setOpen(false)}>
                Get Free Quote
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
