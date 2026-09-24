import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: "#0D0712",
          surface: "#160D1F",
          card: "#1D1028",
          border: "#3B1F4D",
          text: "#F8FAFC",
          muted: "#A78BFA",
          primary: "#7C3AED",
          secondary: "#A855F7",
          accent: "#EF4444",
          deepRed: "#B91C1C",
        },
      },
      backgroundImage: {
        'purple-red-gradient': 'linear-gradient(135deg, #7C3AED, #EF4444)',
        'purple-red-hover': 'linear-gradient(135deg, #8B5CF6, #F87171)',
        'card-gradient': 'linear-gradient(180deg, rgba(29, 16, 40, 0.9) 0%, rgba(22, 13, 31, 0.9) 100%)',
      },
      boxShadow: {
        glow: "0 0 25px rgba(124, 58, 237, 0.35)",
        redGlow: "0 0 25px rgba(239, 68, 68, 0.35)",
        combinedGlow: "0 0 30px rgba(124, 58, 237, 0.25), 0 0 15px rgba(239, 68, 68, 0.2)",
      },
    },
  },
  plugins: [],
};
export default config;
