module.exports = {
  content: ["./src/**/*.{vue,js,ts}"],
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark", "garden", "autumn"],
    styled: true,
  },
};
