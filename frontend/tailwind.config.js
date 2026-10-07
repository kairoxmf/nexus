/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#132F52",
          light: "#1C4270",
          deep: "#0E2543",
          darker: "#0A2038",
          abyss: "#061323",
        },
        ink: "#0E1B2C",
        gold: {
          DEFAULT: "#E9A51F",
          soft: "#F3B742",
          pale: "#FDF1DA",
          dark: "#C7870C",
        },
        ivory: "#F8F7F4",
        mist: "#F2F5F9",
        line: "#E5E9EF",
        muted: "#5B6B7E",
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      maxWidth: { shell: "80rem" },
      boxShadow: {
        card: "0 1px 2px rgba(14,27,44,0.05), 0 8px 28px -12px rgba(14,27,44,0.14)",
        lifted: "0 4px 10px rgba(14,27,44,0.06), 0 24px 48px -16px rgba(14,27,44,0.22)",
      },
    },
  },
  plugins: [],
};
