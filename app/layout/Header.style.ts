import { styled } from "@/styles/jsx"

export const Header = styled("header", {
  base: {
    position: "relative",
    height: "72px",
    background: "white",
    borderBottom: "1px solid #eaeaea",
  },
  variants: {
    size: {
      desktop: {},
      mobile: {},
    },
  },
})
