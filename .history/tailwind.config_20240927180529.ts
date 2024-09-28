/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Config } from "tailwindcss"
const defaultTheme = require("tailwindcss/defaultTheme")

const colors = require("tailwindcss/colors")
const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette")

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      sm: "640px",
      // => @media (min-width: 640px) { ... }

      md: "768px",
      // => @media (min-width: 768px) { ... }

      lg: "1024px",
      // => @media (min-width: 1024px) { ... }

      xl: "1280px",
      // => @media (min-width: 1280px) { ... }

      "2xl": "1536px",
      // => @media (min-width: 1536px) { ... }
    },
    extend: {
      colors: {
        dark: {
          100: "#5E5E5E",
          200: "#545454",
          300: "#494949",
          400: "#3D3D3D",
          500: "#313131",
          600: "#232323",
          700: "#181818",
          800: "#0F0F0F",
        },
        light: {
          100: "#ECECEC",
          200: "#E4E4E4",
          300: "#D8D8D8",
          400: "#CCCCCC",
          500: "#BFBFBF",
          600: "#B5B5B5",
          700: "#A9A9A9",
          800: "#9B9B9B",
        },
        primary: "#b9fe13",
      },
      fontFamily: {
        dokmaiLight: "'dokmai-light', sans-serif",
        dokmaiRegular: "'dokmai-regular', sans-serif",
        dokmaiItalic: "'dokmai-italic', sans-serif",
        dokmaiBold: "'dokmai-bold', sans-serif",
        dokmaiBoldItalic: "'dokmai-bold-italic', sans-serif",
        dokmaiBoldRounded: "'dokmai-bold-rounded', sans-serif",
      },
    },
  },
  plugins: [addVariablesForColors],
}
function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme("colors"))
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  )

  addBase({
    ":root": newVars,
  })
}
export default config
