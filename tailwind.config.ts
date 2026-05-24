import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#eee9df',
        surface: '#ffffff',
        ink: { DEFAULT: '#3a3d35', muted: '#7a8471' },
        sage: { DEFAULT: '#588157', soft: '#a3b18a' },
      },
      fontFamily: {
        sans: ['Pretendard', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        label: ['Inter Tight', 'Inter', 'sans-serif'],
      },
      letterSpacing: { label: '0.25em' },
    },
  },
  plugins: [],
} satisfies Config;
