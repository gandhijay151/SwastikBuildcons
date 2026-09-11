/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#202323',
        coal: '#2B2E2E',
        gold: '#AA513C',
        champagne: '#C9CFCD',
        paper: '#EEF0ED',
        ivory: '#DDE2DF',
        mist: '#BFC7C4',
        rust: '#AA513C',
        burgundy: '#8B2635',
        brass: '#C9A227',
        charcoal: '#1A1A1A',
        slate: '#4A4A4A',
      },
      boxShadow: {
        gold: '0 18px 60px rgba(170, 81, 60, 0.22)',
        soft: '0 18px 48px rgba(32, 35, 35, 0.12)',
        crisp: '0 12px 32px rgba(32, 35, 35, 0.08)',
        'gold-brass': '0 18px 60px rgba(201, 162, 39, 0.25)',
        'soft-dark': '0 18px 48px rgba(26, 26, 26, 0.15)',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'Cambria', 'serif'],
        sans: ['DM Sans', 'Inter', 'Manrope', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      backgroundImage: {
        'premium-grid':
          'linear-gradient(rgba(170,81,60,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(170,81,60,.08) 1px, transparent 1px)',
        'ivory-blueprint':
          'linear-gradient(rgba(32,35,35,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(32,35,35,.055) 1px, transparent 1px)',
        'brass-grid':
          'linear-gradient(rgba(201,162,39,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,.06) 1px, transparent 1px)',
      },
      backgroundBlendMode: {
        'overlay': 'overlay',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};