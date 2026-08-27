tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { 
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          900: '#064e3b',
          glow: '#00ff87'
        },
        dark: {
          950: '#080a0f',
          900: '#0f131c',
          800: '#171d2b',
          700: '#232b3e'
        }
      }
    }
  }
}