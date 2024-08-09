module.exports = {
  content: ["./src/**/*.{vue,js,ts}"],
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark", "cupcake", "autumn", "bumblebee"],
    styled: true,
  },
};
