import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#0B0B1E',
        ink: '#13112B',
        gold: '#C9A84C',
        'gold-light': '#E8D080',
        parchment: '#F5EFE0',
        mist: '#9B8FBF',
        veil: '#1E1A38',
        coral: '#E84430',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
        mono: ['ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'magic-radial': 'radial-gradient(ellipse at 30% 20%, #2D1B69 0%, #0B0B1E 60%)',
      },
    },
  },
  plugins: [],
};
export default config;
