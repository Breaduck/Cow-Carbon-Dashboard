/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        livestock: {
          beef: '#8B4513',
          dairy: '#1E40AF',
          pig: '#EC4899',
        },
        gas: {
          ch4: '#FF6B6B',
          co2: '#4ECDC4',
          n2o: '#FFE66D',
          nh3: '#95E1D3',
        },
      },
    },
  },
  plugins: [],
}
