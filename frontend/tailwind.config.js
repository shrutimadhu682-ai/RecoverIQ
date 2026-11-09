/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fintech: {
          darkest: '#070A11',
          bg: '#0B0F19',
          card: '#121929',
          cardHover: '#182238',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(56, 189, 248, 0.3)',
          subtle: '#94A3B8',
          primary: '#38BDF8',     // Electric blue
          primaryDark: '#0284C7',
          secondary: '#818CF8',   // Soft lavender
          accent: '#2DD4BF',      // Emerald teal
          warning: '#F59E0B',     // Amber
          danger: '#F43F5E',      // Rose/Red
          success: '#10B981',     // Green
          purple: '#A855F7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 25px -5px rgba(56, 189, 248, 0.25)',
        'glow-accent': '0 0 25px -5px rgba(45, 212, 191, 0.25)',
        'glow-danger': '0 0 25px -5px rgba(244, 63, 94, 0.25)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
