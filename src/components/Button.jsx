import { Link } from 'react-router-dom';

const styles = {
  primary:
    'bg-burgundy text-white hover:bg-brass hover:text-ink shadow-gold-brass border border-burgundy button-shine pulse-animation',
  secondary:
    'bg-transparent text-white border border-white/35 hover:border-brass hover:text-brass button-shine',
  dark: 'bg-ink text-white border border-ink hover:bg-burgundy hover:text-white hover:border-burgundy button-shine',
  light:
    'bg-white text-ink border border-white hover:bg-brass hover:border-brass button-shine',
};

export default function Button({ children, href, to, type = 'primary', className = '', ...props }) {
  const classes = `inline-flex items-center justify-center rounded-md px-5 py-3.5 text-sm font-bold transition-all duration-500 float-on-hover ${styles[type]} ${className}`;

  // Internal route navigation (react-router)
  if (to) {
    return (
      <Link className={classes} to={to} {...props}>
        {children}
      </Link>
    );
  }

  // External / anchor links and mailto/tel
  if (href) {
    return (
      <a className={classes} href={href} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
