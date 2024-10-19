/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#2c1466',
          dark: '#f4dad6',
        },
        secondary: {
          light: '#a7488f',
          dark: '#e44e92',
        },
        background: {
          light: '#f1a5c6',
          dark: '#2c1466',
        },
        text: {
          light: '#2c1466',
          dark: '#fbe9d5',
        },
        accent: {
          light: '#693c89',
          dark: '#a7488f',
        },
        content: {
          light: '#fffbf8',
          dark: '#1a0d3d',
        },
      },
      boxShadow: {
        center: "0 0 12px -2px rgb(0 0 0 / 0.05)",
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      screens: {
        xs: "480px",
        sm: "768px",
        md: "1024px",
        lg: "1440px",
        xl: "1920px",
        "2xl": "2560px",
      },
    },
  },
  plugins: [
    function({ addComponents }) {
      addComponents({
        '.btn-primary': {
          padding: '0.5rem 1rem',
          borderRadius: '2rem',
          fontWeight: '600',
          backgroundColor: '#2c1466',
          color: 'white',
          '&:hover': {
            backgroundColor: '#693c89',
          },
          '&:disabled': {
            backgroundColor: '#ccc',
            cursor: 'not-allowed',
          },
        },
        '.btn-secondary': {
          padding: '0.5rem 1rem',
          borderRadius: '2rem',
          fontWeight: '600',
          backgroundColor: '#a7488f',
          color: 'white',
          '&:hover': {
            backgroundColor: '#693c89',
          },
          '&:disabled': {
            backgroundColor: '#ccc',
            cursor: 'not-allowed',
          },
        },
      })
    },
  ],
};
