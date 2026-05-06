import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        amazon: {
          green: "#007185",
          dark: "#232f3e",
          orange: "#FF9900",
          light: "#e7f4f5",
        },
        primary: {
          DEFAULT: "#007185", // Amazon Green/Teal
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#FF9900", // Amazon Orange
          foreground: "#ffffff",
        }
      },
    },
  },
  plugins: [],
};
export default config;
