/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: '#F7F3EE',
        beige: '#E9E0D8',
        text: '#252525',
        muted: '#68635F',
        border: '#C9BFB6',
        accent: '#6E7560',
      },
      boxShadow: {
        soft: '0 25px 60px rgba(37, 37, 37, 0.08)',
      },
    },
  },
  plugins: [],
}

