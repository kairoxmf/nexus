/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#16324F", light: "#1E4265", deep: "#10263F", darker: "#0C1F35", abyss: "#091826" },
        ink: "#122033",
        gold: { DEFAULT: "#C8A15C", soft: "#D9BE8C", pale: "#F0E5D0" },
        ivory: "#F8F5EF",
        sand: "#EFEAE0",
        mist: "#EDF2F6",
        line: "#E6E2D8",
        muted: "#5C6B7C",
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      maxWidth: { shell: "80rem" },
    },
  },
  plugins: [],
};
