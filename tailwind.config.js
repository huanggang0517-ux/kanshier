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
      }
    },
  },
  plugins: [],
}
