/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'typewriter': ['"Courier Prime"', 'monospace'],
        'sans': ['"Courier Prime"', 'monospace'],
        'mono': ['"Courier Prime"', 'monospace'],
      }
    }
  },
  plugins: [],
}

