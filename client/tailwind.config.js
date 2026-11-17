/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-page)',
        surface: 'var(--bg-surface)',
        'surface-subtle': 'var(--bg-surface-subtle)',
        'surface-hover': 'var(--bg-surface-hover)',
        border: 'var(--border-color)',
        'border-subtle': 'var(--border-subtle-color)',
        primary: {
          DEFAULT: 'var(--text-primary)',
          hover: '#1e293b',
          active: '#334155',
        },
        brand: {
          DEFAULT: '#ff4800', // Iconic Payoneer Orange-Red
          hover: '#ea3e00',
          light: '#fff4f0',
          border: '#ffd4c4',
        },
        accent: {
          DEFAULT: '#ff4800',
          hover: '#ea3e00',
          light: '#fff4f0',
          border: '#ffd4c4',
        },
        triage: {
          assistant: {
            bg: '#eff6ff',
            text: '#1d4ed8',
            border: '#bfdbfe',
          },
          client: {
            bg: '#fff7ed',
            text: '#c2410c',
            border: '#ffedd5',
          },
          none: {
            bg: '#f1f5f9',
            text: '#475569',
            border: '#e2e8f0',
          },
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        soft: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
        hover: '0 8px 30px -4px rgba(15, 23, 42, 0.08)',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
