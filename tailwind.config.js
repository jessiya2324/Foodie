/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#f05a36", dark: "#d94b2a", soft: "#fff1ec" },
        ink: "#202124",
      },
      boxShadow: {
        card: "0 12px 35px rgba(34, 24, 20, .08)",
      },
    },
  },
  plugins: [],
};
