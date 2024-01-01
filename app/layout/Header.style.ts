import { styled } from "@/styles/jsx"

export const Header = styled("header", {
  base: {
    position: "relative",
    height: "72px",
    background: "red",
  },
  variants: {
    size: {
      desktop: {},
      mobile: {},
    },
  },
})
