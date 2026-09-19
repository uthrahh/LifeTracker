import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "rgb(var(--color-ink) / <alpha-value>)",
          soft: "rgb(var(--color-ink-soft) / <alpha-value>)",
          faint: "rgb(var(--color-ink-faint) / <alpha-value>)",
        },
        paper: {
          DEFAULT: "rgb(var(--color-paper) / <alpha-value>)",
          raised: "rgb(var(--color-paper-raised) / <alpha-value>)",
        },
        glass: "rgb(var(--color-glass) / <alpha-value>)",
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          soft: "rgb(var(--color-accent-soft) / <alpha-value>)",
        },
        border: "rgb(var(--color-border) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgb(0 0 0 / 0.25)",
        glow: "0 0 40px -8px rgb(var(--color-accent) / 0.35)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "rise-in": { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        drift: { "0%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" }, "100%": { transform: "translateY(0)" } },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "rise-in": "rise-in 0.5s ease-out",
        drift: "drift 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
