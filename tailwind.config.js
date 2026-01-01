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
        'fade-out': 'fadeOut 150ms ease-out',
        'slide-up': 'slideUp 200ms ease-out',
        'slide-down': 'slideDown 200ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
        'spin-slow': 'spin 1.5s linear infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'success-bounce': 'successBounce 600ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        successBounce: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
