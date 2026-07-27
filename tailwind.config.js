/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand accent — bright corporate blue (primary accent)
        brand: {
          DEFAULT: '#007AFF',
          50: '#E8F2FF',
          100: '#D0E5FF',
          200: '#A3CBFF',
          300: '#75B2FF',
          400: '#4798FF',
          500: '#007AFF',
          600: '#0066D6',
          700: '#004D9C',
          800: '#003363',
          900: '#001A33',
        },
        // Neutral surfaces — white cards with soft shadows
        surface: {
          DEFAULT: '#F5F7FA',
          bright: '#FFFFFF',
          low: '#F0F3F8',
          container: '#EBEEF3',
          high: '#E6E9EF',
          highest: '#E0E3EA',
        },
        ink: {
          DEFAULT: '#0F1620',
          soft: '#1F2A3C',
          muted: '#5A6577',
          subtle: '#8A93A3',
          faint: '#AEB4C0',
        },
        line: {
          DEFAULT: '#D8DDE6',
          soft: '#E4E8EE',
        },
        // Risk / status colors
        danger: {
          DEFAULT: '#FF3B30',
          soft: '#FFE0DC',
          deep: '#C1000A',
        },
        warn: {
          DEFAULT: '#FFB020',
          soft: '#FFF3D6',
          deep: '#A66B00',
        },
        ok: {
          DEFAULT: '#34C759',
          soft: '#D8F8E0',
          deep: '#1A7A33',
        },
      },
      fontFamily: {
        display: ['Hanken Grotesk', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-xl': ['40px', { lineHeight: '44px', letterSpacing: '-0.03em', fontWeight: '800' }],
        'display-lg': ['32px', { lineHeight: '38px', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-md': ['24px', { lineHeight: '30px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'title-md': ['20px', { lineHeight: '26px', fontWeight: '700' }],
        'title-sm': ['17px', { lineHeight: '22px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '26px', fontWeight: '400' }],
        'body-md': ['15px', { lineHeight: '22px', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'label-sm': ['13px', { lineHeight: '18px', letterSpacing: '0.01em', fontWeight: '500' }],
        'label-xs': ['11px', { lineHeight: '16px', letterSpacing: '0.08em', fontWeight: '600' }],
        'mono-sm': ['12px', { lineHeight: '16px', fontWeight: '500' }],
      },
      borderRadius: {
        card: '1.25rem',
        pill: '9999px',
      },
      boxShadow: {
        card: '0 4px 24px -8px rgba(15, 22, 32, 0.08), 0 2px 8px -4px rgba(15, 22, 32, 0.06)',
        'card-hover': '0 12px 40px -12px rgba(0, 122, 255, 0.18), 0 4px 12px -6px rgba(15, 22, 32, 0.08)',
        glow: '0 0 24px rgba(0, 122, 255, 0.35)',
        'glow-danger': '0 0 20px rgba(255, 59, 48, 0.45)',
        'glow-warn': '0 0 16px rgba(255, 176, 32, 0.4)',
        float: '0 20px 50px -20px rgba(15, 22, 32, 0.25)',
      },
      spacing: {
        'safe-b': 'env(safe-area-inset-bottom)',
      },
      keyframes: {
        'scan-line': {
          '0%': { transform: 'translateY(0)', opacity: '0' },
          '8%': { opacity: '1' },
          '92%': { opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        'pulse-ring': {
          '0%, 100%': { opacity: '0.7', transform: 'scale(1)' },
          '50%': { opacity: '0.3', transform: 'scale(1.25)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.15)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'sheet-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'marker-bob': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'flash': {
          '0%': { opacity: '0.9' },
          '100%': { opacity: '0' },
        },
        'flicker': {
          '0%, 100%': { opacity: '0.85' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'scan-line': 'scan-line 4s linear infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-dot': 'pulse-dot 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'sheet-up': 'sheet-up 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'pop-in': 'pop-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'marker-bob': 'marker-bob 2.5s ease-in-out infinite',
        'flash': 'flash 0.4s ease-out',
        'flicker': 'flicker 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
