/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        xs: '480px',
      },
      colors: {
        ink: {
          DEFAULT: '#141A1B',
          soft: '#1C2325',
          softer: '#242C2E',
        },
        bone: {
          DEFAULT: '#F6F3EC',
          soft: '#EEEAE0',
        },
        moss: {
          50: '#EEF2EE',
          100: '#D6E0D7',
          300: '#9DB49F',
          500: '#4C6B52',
          600: '#3E5943',
          700: '#324736',
        },
        brass: {
          300: '#E3C489',
          500: '#C08A3E',
          600: '#A16F2C',
        },
        coral: {
          100: '#FBDCD3',
          400: '#EB7C5C',
          500: '#E2593C',
          600: '#C4432A',
        },
        mist: {
          300: '#C7D0CB',
          500: '#93A29A',
          700: '#5F6C66',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        tag: '0 1px 0 rgba(20,26,27,0.06), 0 8px 24px -12px rgba(20,26,27,0.25)',
      },
      keyframes: {
        signalPulse: {
          '0%': { transform: 'scale(0.6)', opacity: '0.65' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
      },
      animation: {
        signal: 'signalPulse 2.2s cubic-bezier(0.2,0.6,0.4,1) infinite',
        'signal-slow': 'signalPulse 3.2s cubic-bezier(0.2,0.6,0.4,1) infinite',
      },
    },
  },
  plugins: [],
};
