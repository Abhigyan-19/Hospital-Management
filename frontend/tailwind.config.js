/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14343b',
        teal: { 50: '#effaf8', 100: '#d8f3ef', 500: '#179c91', 600: '#107d75', 700: '#0d625d' },
        navy: { 50: '#f0f6fa', 100: '#dcecf5', 500: '#397d9e', 700: '#24536b', 900: '#173a4c' },
        success: '#248b62',
        warning: '#b7791f',
        danger: '#c94b4b',
      },
      fontFamily: { sans: ['Nunito Sans', 'ui-sans-serif', 'sans-serif'] },
      boxShadow: { soft: '0 12px 35px rgba(22, 65, 78, 0.08)' },
    },
  },
  plugins: [],
};
