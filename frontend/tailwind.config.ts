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
        foreground: {
          DEFAULT: "var(--foreground)",
          muted: "var(--foreground-muted)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          raised: "var(--surface-raised)",
          dark: "var(--surface-dark)",
        },
        border: "var(--border)",
        brand: {
          indigo: "#1B2A4A",
          amber: "#D97706",
          ochre: "#B45309",
          bone: "#FBFBFA",
          charcoal: "#0F172A",
        },
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          foreground: "var(--primary-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          foreground: "var(--accent-foreground)",
          subtle: "var(--accent-subtle)",
          "subtle-foreground": "var(--accent-subtle-foreground)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "Noto Sans Kannada", "Tunga", "-apple-system", "sans-serif"],
        kannada: ["Noto Sans Kannada", "Tunga", "Vijaya", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
