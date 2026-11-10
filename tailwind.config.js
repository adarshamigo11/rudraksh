/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c',
          500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12',
        },
        maroon: {
          50: '#fdf2f2', 100: '#fbe3e1', 200: '#f6c4c0', 300: '#ee9a93', 400: '#e1665c',
          500: '#cf4439', 600: '#b3322a', 700: '#932a24', 800: '#7a2420', 900: '#5e1d1a', 950: '#330e0c',
        },
        cream: '#fffaf2',
        gold: '#c9a24b',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
