/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // colors: {
      //   background: "var(--background)",
      //   foreground: "var(--foreground)",

      //   border: "var(--border)",
      //   input: "var(--input)",
      //   ring: "var(--ring)",

      //   muted: "var(--muted)",
      //   "muted-foreground": "var(--muted-foreground)",

      //   primary: {
      //     DEFAULT: "var(--primary)",
      //     foreground: "var(--primary-foreground)",
      //   },

      //   destructive: "var(--destructive)",
      // },
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
    },
  },
  plugins: [],
}