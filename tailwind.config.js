/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#faf5f0', 100: '#f0ebe4', 200: '#e8ddd0',
          300: '#d4bfa8', 400: '#c9a96e', 500: '#b8944f', 600: '#8b6f47',
        },
        ink: { DEFAULT: '#2c2416', light: '#5a4a3a', muted: '#8c7a66' },
        parchment: { DEFAULT: '#f5f0e8', light: '#faf8f5', dark: '#e8e0d0' },
        cinnabar: { DEFAULT: '#b84a40', light: '#d4655a', dark: '#8e3a32' },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Noto Serif SC', 'Songti SC', 'serif'],
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        '0-5': '2px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '24': '96px',
      },
      borderRadius: {
        xs: '2px',
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        pill: '9999px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(44,36,22,0.04)',
        sm: '0 4px 12px -2px rgba(44,36,22,0.06)',
        md: '0 12px 32px -4px rgba(44,36,22,0.08)',
        lg: '0 24px 48px -12px rgba(44,36,22,0.12)',
        gold: '0 4px 16px rgba(184,148,79,0.25)',
      },
      maxWidth: {
        content: '1152px',
        app: '480px',
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.8s ease-out both',
        'taiji-float': 'taiji-float 4s ease-in-out infinite',
        'ink-spread': 'ink-spread 0.6s ease-out both',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'taiji-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'ink-spread': {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
        wide: '0.05em',
        wider: '0.1em',
        widest: '0.2em',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '250ms',
        slow: '400ms',
      },
    },
  },
  plugins: [],
}
