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
          light: '#6841c2',
          dark: '#633dbd',
        },
        secondary: {
          light: '#ad79d1',
          dark: '#612e85',
        },
        background: {
          light: '#f1a5c6',
          dark: '#2c1466',
        },
        text: {
          light: '#140a2e',
          dark: '#dbd1f5',
        },
        accent: {
          light: '#f7c0da',
          dark: '#3f0822',
        },
        content: {
          light: '#fffbf8',
          dark: '#0D0D0D',
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
          backgroundColor: '#ad79d1',
          color: 'white',
          '&:hover': {
            backgroundColor: '#6841c2',
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
          backgroundColor: '#693c89',
          color: 'white',
          '&:hover': {
            backgroundColor: '#ad79d1',
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
