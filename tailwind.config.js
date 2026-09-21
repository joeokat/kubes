/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f7f5",
          100: "#e5ece7",
          500: "#2d6a4f",
          600: "#1b4332",
          700: "#081c15",
        },
      },
    },
  },
  plugins: [],
};
