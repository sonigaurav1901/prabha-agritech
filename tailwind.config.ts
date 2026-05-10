import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        prabha: {
          forest: "#1B4332",
          soil:   "#1C1209",
          sage:   "#52B788",
          amber:  "#D4A017",
          night:  "#0D1F15",
          cream:  "#FAF7F0",
          muted:  "#6B6B6B",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        body:    ["var(--font-dm-sans)", "sans-serif"],
        mono:    ["var(--font-space-grotesk)", "sans-serif"],
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 0px rgba(82,183,136,0)" },
          "50%":      { boxShadow: "0 0 32px rgba(82,183,136,0.5)" },
        },
        "float-up": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "float-up":   "float-up 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
