import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
    './pages/**/*.{ts,tsx,js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: '#121213',
        foreground: '#ededed',
        highlight: '#8b5cf6',
        border: '#2c2c2c',
        surface: '#18181a'
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        full: '9999px'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config; 