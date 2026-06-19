import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        majiai: {
          DEFAULT: "#d6145e",
          primary: "#d6145e",
          dark: "#b01050",
        },
        streak: "#f59e0b",
        app: {
          bg: "#f9fafb",
          dark: "#1a1a2e",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      maxWidth: {
        mobile: "430px",
      },
    },
  },
  plugins: [],
};
export default config;
