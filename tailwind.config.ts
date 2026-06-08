import type { Config } from 'tailwindcss';

/**
 * Ninja-style design tokens.
 * Colours: brand (orange) primary; semantic success/warning/danger/info.
 * Radii:   sm 8 · md 12 · lg 16 · xl 20 · 2xl 24 · 3xl 32 (Tailwind defaults extended).
 * Shadow:  soft (subtle) · card (cards) · pop (floating CTA) · sheet (drawer).
 * Z-index: nav 40 · sticky 30 · drawer 50 · sheet 60 · toast 70.
 */
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Ninja-style turquoise primary. Stays under the `brand-*` namespace
        // so every existing `bg-brand-500 / text-brand-700` usage flips at once.
        brand: {
          50:  '#ecfdf7',
          100: '#d1f4ea',
          200: '#a4e8d8',
          300: '#6dd6c4',
          400: '#3bc4ad',
          500: '#0fbea0',
          600: '#0c9d85',
          700: '#0a7d6a',
          800: '#085e50',
          900: '#053f36',
        },
        // Warm accent (kept for "buy again" tags, badges, gentle highlights).
        accent: {
          50:  '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        success: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        warning: {
          50:  '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        danger: {
          50:  '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        info: {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      fontFamily: {
        sans:   ['var(--font-tajawal)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        latin:  ['var(--font-inter)', 'system-ui', 'sans-serif'],
        arabic: ['var(--font-tajawal)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        soft:  '0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 1px 1px 0 rgba(15, 23, 42, 0.02)',
        card:  '0 6px 24px -8px rgba(15, 23, 42, 0.10), 0 2px 6px -2px rgba(15, 23, 42, 0.05)',
        pop:   '0 16px 40px -12px rgba(15, 190, 160, 0.42), 0 6px 16px -4px rgba(15, 190, 160, 0.18)',
        sheet: '0 -10px 40px -12px rgba(15, 23, 42, 0.20)',
      },
      zIndex: {
        nav:    '40',
        sticky: '30',
        drawer: '50',
        sheet:  '60',
        toast:  '70',
      },
      transitionTimingFunction: {
        'out-soft': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s linear infinite',
        'fade-in': 'fadeIn 200ms ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
