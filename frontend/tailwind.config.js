/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'system-ui', 'sans-serif']
      },
      colors: {
        orange: { DEFAULT: '#FF9F0A', dark: '#FF8C00' },
        ios: {
          blue: '#0A84FF',
          green: '#30D158',
          red: '#FF453A',
          yellow: '#FFD60A',
          purple: '#BF5AF2',
          teal: '#5AC8F5',
        }
      },
      backdropBlur: { xs: '4px' },
      boxShadow: {
        'card': '0 2px 20px rgba(0,0,0,0.4)',
        'modal': '0 8px 40px rgba(0,0,0,0.6)',
        'btn': '0 2px 8px rgba(255,159,10,0.35)',
      }
    }
  },
  plugins: []
};
