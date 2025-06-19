/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
  content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        colors: {
            darkblue: {
                DEFAULT: '#0f172a',
                lighter: '#1e293b',
                hover: '#334155',
            },
        },
    },
  },
  plugins: [],
}

