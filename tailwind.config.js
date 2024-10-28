/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '480px',
      'sm': '768px',
      'md': '1024px',
      'lg': '1440px',
      'xl': '1920px',
      '2xl': '2560px',
    },
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
        btnbg: {
          light: '#ad79d1',
          dark: '#693c89',
        },
        btnhover: {
          light: '#693c89',
          dark: '#ad79d1',
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
    },
  },
  plugins: [
    function({ addComponents, theme }) {
      addComponents({
        '.btn': {
          padding: theme('spacing.2'),
          borderRadius: theme('borderRadius.lg'),
          fontWeight: theme('fontWeight.semibold'),
          transition: 'background-color 0.3s ease, opacity 0.3s ease',
          backgroundColor: theme('colors.btnbg.light'),
          color: theme('colors.white'),
          border: `1px solid ${theme('colors.primary.light')}`,
          '&:hover:not(:disabled):not(.selected)': {
            backgroundColor: theme('colors.btnhover.light'),
          },
          '&:disabled, &.selected': {
            backgroundColor: '#ccc',
            color: theme('colors.gray.700'),
            cursor: 'not-allowed',
            opacity: '0.5',
          },
          '.dark &': {
            backgroundColor: theme('colors.btnbg.dark'),
            borderColor: theme('colors.primary.dark'),
            '&:hover:not(:disabled):not(.selected)': {
              backgroundColor: theme('colors.btnhover.dark'),
            },
            '&:disabled, &.selected': {
              backgroundColor: '#ccc',
              color: theme('colors.gray.700'),
              cursor: 'not-allowed',
              opacity: '0.5',
            },
          },
        },
        '.btn-chart': {
          padding: '0.25rem 0.5rem',
          borderRadius: '0.375rem',
          fontSize: '0.75rem',
          lineHeight: '1rem',
          fontWeight: '600',
          color: 'white',
          transition: 'background-color 0.3s ease, opacity 0.3s ease',
          backgroundColor: '#ad79d1',
          '&:not(:disabled):not(.selected):hover': {
            backgroundColor: '#6841c2',
          },
          '&:disabled, &.selected': {
            backgroundColor: '#ccc',
            color: theme('colors.gray.700'),
            cursor: 'not-allowed',
            opacity: '0.5',
          },
          '.dark &': {
            backgroundColor: '#612e85',
            '&:not(:disabled):not(.selected):hover': {
              backgroundColor: '#ad79d1',
            },
            '&:disabled, &.selected': {
              backgroundColor: '#ccc',
              color: theme('colors.gray.700'),
              cursor: 'not-allowed',
              opacity: '0.5',
            },
          },
        },
        '.btn-selectable': {
          '&.selected': {
            backgroundColor: '#040404',
            color: theme('colors.gray.300'),
            cursor: 'pointer',
            opacity: '0.5',
          },
          '.dark &.selected': {
            backgroundColor: '#040404',
            color: theme('colors.gray.300'),
            cursor: 'pointer',
            opacity: '0.5',
          }
        },
      });
    },
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.text-responsive': {
          fontSize: theme('fontSize.xs[0]'),
          lineHeight: theme('fontSize.xs[1].lineHeight'),
          '@screen sm': {
            fontSize: theme('fontSize.sm[0]'),
            lineHeight: theme('fontSize.sm[1].lineHeight'),
          },
          '@screen md': {
            fontSize: theme('fontSize.base[0]'),
            lineHeight: theme('fontSize.base[1].lineHeight'),
          },
          '@screen lg': {
            fontSize: theme('fontSize.lg[0]'),
            lineHeight: theme('fontSize.lg[1].lineHeight'),
          },
          '@screen xl': {
            fontSize: theme('fontSize.xl[0]'),
            lineHeight: theme('fontSize.xl[1].lineHeight'),
          },
          '@screen 2xl': {
            fontSize: theme('fontSize.2xl[0]'),
            lineHeight: theme('fontSize.2xl[1].lineHeight'),
          },
        },
        '.btn-responsive': {
          padding: `${theme('spacing.1')} ${theme('spacing.1')}`,
          fontSize: '0.625rem', // 10px
          '@screen xs': {
            padding: `${theme('spacing.1')} ${theme('spacing.2')}`,
            fontSize: theme('fontSize.xs[0]'),
          },
          '@screen sm': {
            padding: `${theme('spacing.2')} ${theme('spacing.3')}`,
            fontSize: theme('fontSize.sm[0]'),
          },
          '@screen md': {
            padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
            fontSize: theme('fontSize.base[0]'),
          },
          '@screen lg': {
            padding: `${theme('spacing.3')} ${theme('spacing.5')}`,
            fontSize: theme('fontSize.lg[0]'),
          },
          '@screen xl': {
            padding: `${theme('spacing.3')} ${theme('spacing.5')}`,
            fontSize: theme('fontSize.lg[0]'),
          },
          '@screen 2xl': {
            padding: `${theme('spacing.3')} ${theme('spacing.5')}`,
            fontSize: theme('fontSize.lg[0]'),
          }
        },
        '.social-icon-responsive': {
          width: theme('spacing.6'),
          height: theme('spacing.6'),
          '@screen sm': {
            width: theme('spacing.6'),
            height: theme('spacing.6'),
          },
          '@screen md': {
            width: theme('spacing.6'),
            height: theme('spacing.6'),
          },
          '@screen lg': {
            width: theme('spacing.6'),
            height: theme('spacing.6'),
          },
          '@screen xl': {
            width: theme('spacing.6'),
            height: theme('spacing.6'),
          },
          '@screen 2xl': {
            width: theme('spacing.6'),
            height: theme('spacing.6'),
          },
        },
      };

      addUtilities(newUtilities);
    },
  ],
};
