import { defineConfig } from "@pandacss/dev"

export default defineConfig({
  eject: true,

  // Whether to use css reset
  preflight: true,

  presets: ["@pandacss/preset-base"],

  // Where to look for your css declarations
  include: ["./app/**/*.{ts,tsx}"],

  // Files to exclude
  exclude: ["./app/components/ui/**/*.tsx", "./app/components/layout/**/*.tsx"],

  // Useful for theme customization
  theme: {
    tokens: {
      sizes: {
        full: { value: "100%" },
      },
    },
    extend: {},
  },

  // The output directory for your css system
  outdir: "styled-system",

  jsxFramework: "react",
})
