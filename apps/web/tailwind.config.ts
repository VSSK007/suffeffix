import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        raised: "var(--raised)",
        sunk: "var(--sunk)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        faint: "var(--faint)",
        rule: "var(--rule)",
        accent: "var(--accent)",
        indo: "var(--indo)",
        drav: "var(--drav)",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Spectral", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: { page: "70rem" },
    },
  },
  plugins: [],
} satisfies Config;
