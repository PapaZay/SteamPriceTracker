/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
  content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        letterSpacing: {
            'pixel': '0.1em',
        },
        colors: {
            darkblue: {
                DEFAULT: '#0f172a',
                lighter: '#1e293b',
                hover: '#334155',
            },
        },
        fontFamily: {
            pixel: ['"Press Start 2P"', 'cursive'],
            exo: ['"Exo 2"', 'sans-serif'],
            sans: ['"Exo 2"', 'system-ui', 'sans-serif'],
        },
    },
  },
  plugins: [],
}

