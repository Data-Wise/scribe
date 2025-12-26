/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Oxford Dark Theme - Premium Academic Aesthetic (default)
        'nexus-bg-primary': 'var(--nexus-bg-primary)',
        'nexus-bg-secondary': 'var(--nexus-bg-secondary)',
        'nexus-bg-tertiary': 'var(--nexus-bg-tertiary)',
        'nexus-text-primary': 'var(--nexus-text-primary)',
        'nexus-text-muted': 'var(--nexus-text-muted)',
        'nexus-accent': 'var(--nexus-accent)',
        'nexus-accent-hover': 'var(--nexus-accent-hover)',
        'nexus-success': '#10b981',         // Emerald green
        'nexus-warning': '#f59e0b',         // Amber
        'nexus-error': '#ef4444',           // Rose red
        'nexus-purple': '#818cf8',          // Indigo (Prestige)
        'nexus-pink': '#f472b6',            // Soft pink
      },
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        'display': ['Outfit', 'Inter', 'sans-serif'],
      },

      fontSize: {
        'editor': ['1.125rem', { lineHeight: '1.8' }], // 18px
      },
      animation: {
        'fade-in': 'fadeIn 150ms ease-out',
        'slide-up': 'slideUp 200ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
