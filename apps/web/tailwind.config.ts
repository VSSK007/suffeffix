import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        sunk: "var(--sunk)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        muted: "var(--muted)",
        faint: "var(--faint)",
        line: "var(--line)",
        "line-2": "var(--line-2)",
        ie: "var(--ie)",
        "ie-ink": "var(--ie-ink)",
        "ie-wash": "var(--ie-wash)",
        dr: "var(--dr)",
        "dr-ink": "var(--dr-ink)",
        "dr-wash": "var(--dr-wash)",
        con: "var(--con)",
        "con-wash": "var(--con-wash)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: { page: "80rem" },
      boxShadow: { lift: "var(--shadow)" },
    },
  },
  plugins: [],
} satisfies Config;
