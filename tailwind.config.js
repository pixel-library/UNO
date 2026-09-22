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
          red: {
            DEFAULT: "#E52521",
            dark: "#B3100C",
            light: "#FF3B30",
          },
          yellow: {
            DEFAULT: "#FCD116",
            dark: "#D9AC00",
            light: "#FFE033",
          },
          green: {
            DEFAULT: "#2D963F",
            dark: "#1E6B2C",
            light: "#34C759",
          },
          blue: {
            DEFAULT: "#0082CA",
            dark: "#005B9E",
            light: "#0095FF",
          },
          wild: {
            DEFAULT: "#9333EA",
            dark: "#6B21A8",
            light: "#A855F7",
          },
          navy: {
            DEFAULT: "#0C1B33",
            dark: "#061A35",
            light: "#1E293B",
          },
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
        display: ['Fredoka', 'Outfit', 'sans-serif']
      },
      boxShadow: {
        'card': '0 8px 16px -2px rgba(0, 0, 0, 0.25), 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.15)',
        'card-glow': '0 0 20px rgba(252, 209, 22, 0.6)',
        'glow-red': '0 0 20px rgba(229, 37, 33, 0.5)',
        'glow-blue': '0 0 20px rgba(0, 130, 202, 0.5)',
        'glow-green': '0 0 20px rgba(45, 150, 63, 0.5)',
        'glow-yellow': '0 0 20px rgba(252, 209, 22, 0.6)',
        '3d-red': '0 6px 0 0 #B3100C, 0 10px 15px rgba(229, 37, 33, 0.4)',
        '3d-yellow': '0 6px 0 0 #D9AC00, 0 10px 15px rgba(252, 209, 22, 0.4)',
        '3d-green': '0 6px 0 0 #1E6B2C, 0 10px 15px rgba(45, 150, 63, 0.4)',
        '3d-blue': '0 6px 0 0 #005B9E, 0 10px 15px rgba(0, 130, 202, 0.4)',
        '3d-navy': '0 6px 0 0 #061A35, 0 10px 15px rgba(12, 27, 51, 0.4)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'float': 'float 3s infinite ease-in-out',
        'card-pop': 'cardPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'bounce-subtle': 'bounceSubtle 2s infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
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
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' }
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      }
    },
  },
  plugins: [],
}

