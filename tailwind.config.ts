import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10212f",
        clay: "#a14524",
        sand: "#f3ece2",
        moss: "#54694b",
        mist: "#d4dde2"
      },
      boxShadow: {
        card: "0 20px 60px rgba(16, 33, 47, 0.12)"
      },
      backgroundImage: {
        "hero-grid": "radial-gradient(circle at top, rgba(255,255,255,0.7), rgba(255,255,255,0) 40%), linear-gradient(135deg, rgba(84,105,75,0.08) 25%, transparent 25%), linear-gradient(225deg, rgba(161,69,36,0.06) 25%, transparent 25%)"
      }
    }
  },
  plugins: []
};

export default config;
