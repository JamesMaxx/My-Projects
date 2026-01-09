// Use the new PostCSS plugin package for Tailwind
// https://github.com/tailwindlabs/tailwindcss/releases
// Use object-style plugins to satisfy PostCSS loader expectations.
// The '@tailwindcss/postcss' key points to the Tailwind PostCSS plugin package.
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
