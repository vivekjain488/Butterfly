/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber-bg': '#000814',
        'cyber-dark': '#001022',
        'teal-neon': '#00FFE1',
        'teal-dark': '#00ADB5',
        'accent': '#00B3A6',
        'glass': 'rgba(10, 10, 10, 0.6)',
      },
      fontFamily: {
        'heading': ['Sixtyfour', 'monospace'],
        'body': ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 10px rgba(0, 255, 225, 0.3), 0 0 20px rgba(0, 255, 225, 0.2)',
        'neon-strong': '0 0 15px rgba(0, 255, 225, 0.5), 0 0 30px rgba(0, 255, 225, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}
