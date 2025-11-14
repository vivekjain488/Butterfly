/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light theme pastel colors
        'bg-light': '#FEFBF7',
        'bg-secondary': '#FFF8F0',
        'bg-tertiary': '#FAF5ED',
        'primary': '#7DD3C0',
        'primary-light': '#A8E6CF',
        'primary-dark': '#5DBFA9',
        'secondary': '#FFB6C1',
        'secondary-light': '#FFC0CB',
        'secondary-dark': '#FF9FB5',
        'accent': '#C9A9DD',
        'accent-light': '#E8D5FF',
        'accent-dark': '#B189C9',
        'yellow-pastel': '#FFEAA7',
        'yellow-light': '#FFF8DC',
        'green-pastel': '#A8E6CF',
        'green-light': '#D4F1C5',
        'purple-pastel': '#C9A9DD',
        'pink-pastel': '#FFB6C1',
        'text-primary': '#2D3748',
        'text-secondary': '#4A5568',
        'text-muted': '#718096',
        'border-light': '#E2E8F0',
        'card-bg': '#FFFFFF',
      },
      fontFamily: {
        'heading': ['Poppins', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'decorative': ['Comfortaa', 'cursive'],
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 10px 30px rgba(0, 0, 0, 0.1)',
        'colored': '0 4px 20px rgba(125, 211, 192, 0.25)',
        'colored-hover': '0 8px 30px rgba(125, 211, 192, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}
