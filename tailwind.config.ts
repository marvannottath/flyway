import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#08090C",
        foreground: "#EDEDED",
        surface: {
          50: "#12141A",
          100: "#181B24",
          200: "#222634",
          300: "#2E3446",
        },
        brand: {
          cyan: "#00E5FF",
          blue: "#3B82F6",
          purple: "#8B5CF6",
          emerald: "#10B981",
        },
        border: "#202533",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Inter",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "Menlo",
          "Monaco",
          "Courier New",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
