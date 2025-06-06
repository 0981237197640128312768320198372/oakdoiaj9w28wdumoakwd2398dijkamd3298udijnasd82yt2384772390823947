/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Config } from 'tailwindcss';
const defaultTheme = require('tailwindcss/defaultTheme');

const colors = require('tailwindcss/colors');
const { default: flattenColorPalette } = require('tailwindcss/lib/util/flattenColorPalette');

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        dark: {
          '100': '#5E5E5E',
          '200': '#545454',
          '300': '#494949',
          '400': '#3D3D3D',
          '500': '#313131',
          '600': '#232323',
          '700': '#181818',
          '800': '#0F0F0F',
        },
        light: {
          '100': '#ECECEC',
          '200': '#E4E4E4',
          '300': '#D8D8D8',
          '400': '#CCCCCC',
          '500': '#BFBFBF',
          '600': '#B5B5B5',
          '700': '#A9A9A9',
          '800': '#9B9B9B',
        },
        goldVIP: '#FFD700',
        purpleVVIP: '#9500FF',
        primary: '#B9FE13',
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      animation: {
        scroll:
          'scroll var(--animation-duration, 40s) var(--animation-direction, forwards) linear infinite',
      },
      keyframes: {
        scroll: {
          to: {
            transform: 'translate(calc(-50% - 0.5rem))',
          },
        },
      },
      fontFamily: {
        aktivGroteskBlack: ['AktivGrotesk-Black', 'sans-serif'],
        aktivGroteskBlackItalic: ['AktivGrotesk-BlackItalic', 'sans-serif'],
        aktivGroteskBold: ['AktivGrotesk-Bold', 'sans-serif'],
        aktivGroteskBoldItalic: ['AktivGrotesk-BoldItalic', 'sans-serif'],
        aktivGroteskHairline: ['AktivGrotesk-Hairline', 'sans-serif'],
        aktivGroteskHairlineItalic: ['AktivGrotesk-HairlineItalic', 'sans-serif'],
        aktivGroteskItalic: ['AktivGrotesk-Italic', 'sans-serif'],
        aktivGroteskLight: ['AktivGrotesk-Light', 'sans-serif'],
        aktivGroteskLightItalic: ['AktivGrotesk-LightItalic', 'sans-serif'],
        aktivGroteskMedium: ['AktivGrotesk-Medium', 'sans-serif'],
        aktivGroteskMediumItalic: ['AktivGrotesk-MediumItalic', 'sans-serif'],
        aktivGroteskRegular: ['AktivGrotesk-Regular', 'sans-serif'],
        aktivGroteskThin: ['AktivGrotesk-Thin', 'sans-serif'],
        aktivGroteskThinItalic: ['AktivGrotesk-ThinItalic', 'sans-serif'],
        aktivGroteskXBold: ['AktivGrotesk-XBold', 'sans-serif'],
        aktivGroteskXBoldItalic: ['AktivGrotesk-XBoldItalic', 'sans-serif'],
      },
    },
  },
  plugins: [addVariablesForColors],
};
function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme('colors'));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ':root': newVars,
  });
}
export default config;
