/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: {
    files: [
      './src/**/*.{html,ts}',
    ],
    transform: {
      ts: (content) => content,
    },
  },
  safelist: [
    'z-[100]',
    'min-w-[300px]',
    'max-w-[200px]',
    'border-white/10',
    'pointer-events-none',
    'pointer-events-auto',
    { pattern: /^divide-/ },
    { pattern: /^space-/ },
    { pattern: /^hover:/ },
    { pattern: /^animate-/ },
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4f46e5',
          dark: '#4338ca',
          light: '#6366f1',
          container: '#e0e7ff',
          'on-container': '#312e81',
        },
        surface: {
          DEFAULT: '#f8fafc',
          container: '#ffffff',
          'container-high': '#f1f5f9',
        },
        'inverse-surface': {
          DEFAULT: '#1e293b',
          on: '#e2e8f0',
        },
        success: {
          DEFAULT: '#10b981',
          container: '#d1fae5',
          'on-container': '#065f46',
        },
        warning: {
          DEFAULT: '#f59e0b',
          container: '#fef3c7',
          'on-container': '#92400e',
        },
        error: {
          DEFAULT: '#ef4444',
          container: '#fee2e2',
          'on-container': '#991b1b',
        },
        info: {
          DEFAULT: '#3b82f6',
          container: '#dbeafe',
          'on-container': '#1e40af',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
    },
  },
  plugins: [],
};
