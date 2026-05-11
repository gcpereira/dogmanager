import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#effefa",
          100: "#c8fff0",
          200: "#90ffe1",
          300: "#52f6d0",
          400: "#1de4bb",
          500: "#06b6a4",
          600: "#039285",
          700: "#06746b",
          800: "#0a5c56",
          900: "#0c4c48",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
