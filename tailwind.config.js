/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // Enables dark mode toggle
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // 👈 This is where your files actually are
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // Just in case you move components later
  ],
  theme: {
    extend: {
      screens: {
        xs: "400px",
      },
      keyframes: {
        loading: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(300%)" },
        },
      },
      animation: {
        loading: "loading 1.5s infinite linear",
      },
    },
  },
  plugins: [],
};
