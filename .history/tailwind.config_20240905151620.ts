import type { Config } from "tailwindcss";

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
          100: "#342739",
          200: "#2F2334",
          300: "#2B1E31",
          400: "#241929",
          500: "#201625",
          600: "#1A1020",
          700: "#150C19",
          800: "#110A14",
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
        primary: "#9121CA",
      },
      fontFamily: {
                wsnfont: "'WSNFont', sans-serif",
                roboto: ["var(--font-roboto)"],
            },
    },
  },
  plugins: [],
};
export default config;
