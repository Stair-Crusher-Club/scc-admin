import { styled } from "@/styles/jsx"

export const Header = styled("header", {
  base: {
    height: "72px",
    background: "white",
    borderBottom: "1px solid #eaeaea",
    transition: "transform 0.3s",
  },
  variants: {
    size: {
      desktop: { position: "relative" },
      mobile: { position: "fixed", top: 0, width: "100%", zIndex: 10 },
    },
    hidden: {
      true: { transform: "translateY(-100%)" },
      false: { transform: "translateY(0)" },
    },
  },
})
