import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: "hsl(var(--surface))",
        muted: "hsl(var(--muted))",
        border: "hsl(var(--border))",
        accent: "hsl(var(--accent))",
        accentSoft: "hsl(var(--accent-soft))",
        lavender: "hsl(var(--lavender))",
        powder: "hsl(var(--powder))",
        peach: "hsl(var(--peach))",
        heart: "hsl(var(--heart))"
      },
      borderRadius: {
        xl: "1.5rem",
        "2xl": "2rem",
        "3xl": "2.5rem"
      },
      boxShadow: {
        bloom: "0 20px 60px rgba(145, 102, 168, 0.16)",
        paper: "0 16px 45px rgba(34, 24, 55, 0.09)"
      },
      backgroundImage: {
        haze:
          "radial-gradient(circle at 20% 20%, rgba(255, 208, 232, 0.7), transparent 34%), radial-gradient(circle at 82% 18%, rgba(209, 214, 255, 0.75), transparent 26%), linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,249,252,0.82))"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.04)" }
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0px)" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        pulseSoft: "pulseSoft 6s ease-in-out infinite",
        fadeUp: "fadeUp 0.6s ease-out both"
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"]
      }
    }
  },
  plugins: []
};

export default config;
