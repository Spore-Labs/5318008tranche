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
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
      },
      spacing: {
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        // ... (add more if needed)
      },
    },
  },
  plugins: [
    function({ addComponents }) {
      addComponents({
        '.btn-primary': {
          padding: '0.5rem 0.75rem',
          borderRadius: '0.375rem',
          fontSize: '0.75rem',
          lineHeight: '1rem',
          fontWeight: '600',
          backgroundColor: '#ad79d1',
          color: 'white',
          '&:hover': {
            backgroundColor: '#693c89',
          },
          '&:disabled': {
            backgroundColor: '#ccc',
            cursor: 'not-allowed',
            opacity: '0.5',
          },
        },
        '.btn-secondary': {
          padding: '0.5rem 0.75rem',
          borderRadius: '0.375rem',
          fontSize: '0.75rem',
          lineHeight: '1rem',
          fontWeight: '600',
          backgroundColor: '#693c89',
          color: 'white',
          '&:hover': {
            backgroundColor: '#ad79d1',
          },
          '&:disabled': {
            backgroundColor: '#ccc',
            cursor: 'not-allowed',
            opacity: '0.5',
          },
        },
        '.btn-primary.selected, .btn-secondary.selected': {
          backgroundColor: '#ccc',
          cursor: 'not-allowed',
          color: 'white',
        },
        '.btn-chart': {
          padding: '0.25rem 0.5rem',
          borderRadius: '0.375rem',
          fontSize: '0.75rem',
          lineHeight: '1rem',
          fontWeight: '600',
          color: 'white',
          '&.light': {
            backgroundColor: '#ad79d1',
            '&:hover': {
              backgroundColor: '#6841c2',
            },
          },
          '&.dark': {
            backgroundColor: '#612e85',
            '&:hover': {
              backgroundColor: '#ad79d1',
            },
          },
        },
        '.btn-chart-selected': {
          '&.light': {
            backgroundColor: '#ccc',
            cursor: 'not-allowed',
            opacity: '0.5',
          },
          '&.dark': {
            backgroundColor: '#ccc',
            cursor: 'not-allowed',
            opacity: '0.5',
          },
        },
        '.btn-tab': {
          padding: '0.5rem 0.75rem',
          borderTopLeftRadius: '0.375rem',
          borderTopRightRadius: '0.375rem',
          fontSize: '0.75rem',
          lineHeight: '1rem',
          fontWeight: '600',
          backgroundColor: '#ad79d1',
          color: 'white',
          '&:hover': {
            backgroundColor: '#6841c2',
          },
          '&.selected': {
            backgroundColor: '#ccc',
            cursor: 'not-allowed',
            opacity: '0.5',
          },
        },
        '.btn-tab-dark': {
          backgroundColor: '#693c89',
          '&:hover': {
            backgroundColor: '#ad79d1',
          },
          '&.selected': {
            backgroundColor: '#ccc',
            cursor: 'not-allowed',
            opacity: '0.5',
          },
        },
      })
    },
  ],
};
