// Tailwind CSS v4 uses @tailwindcss/postcss instead of the old tailwindcss plugin.
// autoprefixer is no longer needed — Tailwind v4 handles vendor prefixes automatically.
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config
