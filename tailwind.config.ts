import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Bleu du logo MDS
        navy: {
          DEFAULT: "#14315b",
          dark: "#0e2547",
          light: "#1e4a86",
        },
        royal: {
          DEFAULT: "#1a4f97",
          dark: "#143f7d",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "1200px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
