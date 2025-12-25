/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nexus-bg-primary': '#1a1a2e',
        'nexus-bg-secondary': '#16213e',
        'nexus-text-primary': '#e8e8e8',
        'nexus-accent': '#0f3460',
      }
    },
  },
  plugins: [],
}
