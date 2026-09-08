/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
    "./shared/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        uno: {
          red: "#E52521",
          yellow: "#FCD116",
          green: "#2D963F",
          blue: "#0082CA",
          navy: "#0C1B33",
          bgLight: "#F8FAFC",
          cardDark: "#1E1E1E",
          table: {
            light: "#0A5C9E",
            DEFAULT: "#053B6D",
            dark: "#03254C",
            glow: "#0F72C6"
          }
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif']
      },
      boxShadow: {
        'card': '0 8px 16px -2px rgba(0, 0, 0, 0.25), 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.15)',
        'card-glow': '0 0 20px rgba(252, 209, 22, 0.6)',
        'glow-red': '0 0 20px rgba(229, 37, 33, 0.5)',
        'glow-blue': '0 0 20px rgba(0, 130, 202, 0.5)',
        'glow-green': '0 0 20px rgba(45, 150, 63, 0.5)',
        'glow-yellow': '0 0 20px rgba(252, 209, 22, 0.6)'
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'float': 'float 3s infinite ease-in-out',
        'card-pop': 'cardPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(45, 150, 63, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(45, 150, 63, 0.9)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        cardPop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}
