/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0A192F",
          50: "#1A2F4A",
          100: "#152840",
          900: "#050B14",
        },
        ivory: {
          DEFAULT: "#FDFCF8",
          50: "#FAF8F2",
          100: "#F5F2EA",
        },
        champagne: {
          DEFAULT: "#C5A059",
          light: "#D4B675",
          dark: "#A8854A",
        },
        ink: "#050B14",
        "arch-gray": "#E5E2DA",
        "gray-text": "#6B7280",
      },
      fontFamily: {
        display: ['"Archivo"', "system-ui", "sans-serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["clamp(2.5rem,6vw,5rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        heading: ["clamp(2rem,4vw,3rem)", { lineHeight: "1.2", letterSpacing: "-0.015em" }],
      },
      maxWidth: {
        container: "1280px",
      },
      animation: {
        "fade-up": "fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in": "fadeIn 0.6s ease forwards",
        "scale-in": "scaleIn 1.2s cubic-bezier(0.16,1,0.3,1) forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(1.03)" },
          "100%": { transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
