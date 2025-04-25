import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx,js,jsx}", // Ensure it includes your TSX files
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sour-gummy)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
