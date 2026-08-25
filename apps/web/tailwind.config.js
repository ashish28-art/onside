/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        pitch: {
          950: "#0A0F0C", // near-black, green-tinted -- base background
          900: "#121A16", // card surfaces
          800: "#1F2E27", // hairline borders
          600: "#3D5A4A", // muted text / disabled states
          400: "#6B8F7A", // secondary text
        },
        turf: {
          DEFAULT: "#2F9E63", // primary accent -- used sparingly
          light: "#4CBE81",
        },
        chalk: "#F2F5F1", // primary text, line-marking accents
        card: "#E8B93A",  // caution amber -- live indicators, warnings only
        offside: "#D64545", // reserved for destructive/error states only
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      letterSpacing: {
        wordmark: "0.14em",
      },
    },
  },
  plugins: [],
};
