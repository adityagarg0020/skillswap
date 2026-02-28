export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#6C63FF', dark: '#5A52E8', light: '#8B85FF' },
        accent: { DEFAULT: '#FF6B6B', cyan: '#00D2FF', gold: '#FFD700' },
        dark: { bg: '#0A0A0F', card: '#13131A', border: '#1E1E2E', surface: '#1A1A28' }
      },
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        glow: { '0%': { boxShadow: '0 0 5px #6C63FF40' }, '100%': { boxShadow: '0 0 20px #6C63FF80, 0 0 40px #6C63FF40' } },
      }
    }
  },
  plugins: []
};
