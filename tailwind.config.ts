import type { Config } from 'tailwindcss'
import rtlPlugin from 'tailwindcss-rtl'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        nasab: {
          navy: '#0D1B2A',
          gold: '#C9A84C',
          cream: '#F5ECD7',
          green: '#1B5E20',
        },
        // Branch colours
        hasanid: '#1B5E20',
        husaynid: '#0D1B2A',
        hashemite: '#C9A84C',
      },
      fontFamily: {
        // Arabic fonts
        'arabic-display': ['Amiri', 'Scheherazade New', 'serif'],
        'arabic-body': ['Noto Naskh Arabic', 'serif'],
        // English fonts
        'en-display': ['Cormorant Garamond', 'serif'],
        'en-body': ['Inter', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [rtlPlugin],
}

export default config
