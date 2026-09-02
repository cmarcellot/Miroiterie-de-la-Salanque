import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1e6091",
          dark: "#144d75",
          light: "#e8f1f7",
        },
      },
    },
  },
  plugins: [],
};

export default config;
